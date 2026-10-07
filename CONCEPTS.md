# BookMg: Architecture, Concurrency & Core Concepts Guide

Welcome to the architectural design and deep technical documentation for **BookMg**—an enterprise-grade resource and meeting room scheduling platform built with Spring Boot 3.3.5, Spring Cloud 2023.0.3, OpenFeign, JJWT 0.12.6, PostgreSQL / H2, and React 18 with Vite.

---

## 1. System Architecture & Database-per-Service Pattern

BookMg implements a microservices architecture adhering to strict bounded contexts, single responsibility, and the **Database-per-Service** pattern.

```
                              [ React 18 + Vite Frontend ]
                                     (Port: 5173)
                                          │
                                          ▼ HTTP / REST
                            [ Spring Cloud API Gateway ]
                                     (Port: 8080)
                     (JWT Auth Gateway Filter, CORS & Routing)
                                 /        |        \
             ┌──────────────────┘         │         └──────────────────┐
             ▼                            ▼                            ▼
    [ Auth Service ]            [ Resource Service ]          [ Booking Service ]
      (Port: 8081)                 (Port: 8082)                  (Port: 8083)
            │                            │                             │
            │ Feign                      │                             │ Feign Client
            │                            └─────────────────────────────┤ (Resource Validation)
            ▼                                                          ▼
      [(auth_db)]                      [(resource_db)]              [(booking_db)]
   PostgreSQL / H2                  PostgreSQL / H2               PostgreSQL / H2
```

### Why Database-per-Service?
1. **Loose Coupling & Independent Schema Evolution**: The `booking-service` owns reservations, occurrences, and approvals; the `resource-service` owns physical assets, capacities, amenities, and maintenance schedules; the `auth-service` owns credentials and roles. A schema migration or index restructuring in one service never locks tables or disrupts transactions in another.
2. **Polyglot & Sizing Independence**: High-volume, time-indexed booking ranges can be tuned, partitioned, or sharded on `startTime` without impacting the resource catalog or user directories.
3. **Zero Cross-DB Joins**: Cross-service data is never fetched via foreign keys or shared SQL joins. Instead, declarative **OpenFeign clients** (`ResourceClient`) retrieve remote resource representations over internal HTTP with cached responses and strongly typed DTO contracts (`ResourceResponse`).

---

## 2. Atomic Conflict Detection & Concurrency Controls

The single most critical failure mode in room scheduling is **double-booking**—allowing two overlapping reservations for the same physical space.

### Interval Overlap Mathematics
Two continuous time intervals $[S_1, E_1)$ and $[S_2, E_2)$ overlap if and only if:
$$\text{Overlap} \iff S_1 < E_2 \quad \text{AND} \quad E_1 > S_2$$

This standard formula handles all edge cases:
- Complete encapsulation ($S_1 \le S_2 < E_2 \le E_1$)
- Left overhang ($S_1 < S_2 < E_1 < E_2$)
- Right overhang ($S_2 < S_1 < E_2 < E_1$)
- Adjacent/back-to-back meetings ($E_1 = S_2$ or $E_2 = S_1$) do **NOT** overlap (valid continuous scheduling).

### Java Record Invariant: `TimeSlot.java`
```java
public record TimeSlot(LocalDateTime startTime, LocalDateTime endTime) {
    public TimeSlot {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time cannot be null");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be strictly before end time");
        }
    }

    public boolean overlapsWith(TimeSlot other) {
        return this.startTime.isBefore(other.endTime) && this.endTime.isAfter(other.startTime);
    }
}
```

### Concurrency Protection & Optimistic Locking
To prevent race conditions where two concurrent requests check availability simultaneously and both insert:
1. **Spring `@Transactional(isolation = Isolation.READ_COMMITTED)`**: Eliminates dirty reads during interval queries.
2. **JPA Optimistic Locking (`@Version private Long version`)**: Every booking entity maintains a version sequence. Concurrent updates to the same room or state trigger an `OptimisticLockingFailureException`, rolling back the stale transaction.
3. **Exclusion of Terminal Statuses**: Only active reservations (`CONFIRMED`, `PENDING_APPROVAL`, `CHECKED_IN`) participate in conflict checks. Cancelled, completed, or rejected bookings release their time intervals immediately.

```sql
SELECT b FROM Booking b 
WHERE b.resourceId = :resourceId 
  AND b.status NOT IN ('CANCELLED', 'REJECTED')
  AND b.startTime < :endTime 
  AND b.endTime > :startTime
```

---

## 3. Recurrence Engine & 3-Month Bound Rationale

Meeting platforms must support recurring reservations (team standups, weekly 1:1s, monthly town halls) without degrading database performance.

### Strategy Pattern Implementation
BookMg uses a clean factory and strategy pattern:
- **`RecurrenceStrategy`**: Common interface exposing `List<TimeSlot> generateSlots(LocalDateTime start, LocalDateTime end, LocalDateTime recurrenceUntil)`.
- **Implementations**:
  - `DailyRecurrenceStrategy`: Increments by `plusDays(1)`
  - `WeeklyRecurrenceStrategy`: Increments by `plusWeeks(1)`
  - `BiweeklyRecurrenceStrategy`: Increments by `plusWeeks(2)`
  - `MonthlyRecurrenceStrategy`: Increments by `plusMonths(1)`

### The 90-Day (3-Month) Hard Ceiling
Allowing unbounded recurrences ("Repeat every Tuesday forever") is an anti-pattern:
1. **Database Bloom**: A single recurring booking can inject thousands of rows, exhausting disk and degrading B-Tree index scan speeds.
2. **Room Hoarding**: Abandoned recurring reservations block enterprise spaces for years after project teams disband.
3. **Office Layout Volatility**: Room capacities, audio/video equipment, and locations change quarterly.

BookMg strictly enforces:
```java
public static final int MAX_RECURRENCE_DAYS = 90;

if (recurrenceUntil.isAfter(start.plusDays(MAX_RECURRENCE_DAYS))) {
    throw new BadRequestException("Recurring bookings cannot extend beyond 90 days (3 months)");
}
```

### Atomic Batch Conflict Checking & Cascade Cancellation
When a user schedules a recurring series:
1. All future slots are generated in memory.
2. The entire set of candidate slots is checked against existing bookings. If even a **single slot conflicts**, the entire operation fails atomically with a conflict message identifying the conflicting date and time.
3. All occurrences share a unique `recurrenceGroupId` UUID. Calling `DELETE /api/v1/bookings/series/{recurrenceGroupId}` cascades and cancels all remaining occurrences in the series simultaneously.

---

## 4. Multi-Tenant Authority & Approval Policy Engine

Enterprise resources fall into two tiers:
- **Standard Resources**: Instant confirmation (first-come, first-served).
- **Restricted Resources**: Executive boardrooms, high-power compute clusters, lab benches, and broadcast studios require explicit supervisor authorization.

### Policy Factory Pattern
The `ApprovalPolicyFactory` resolves the required gatekeeper based on resource attributes and user department:

```
                            [ Booking Request ]
                                     │
                        Is Resource Restricted?
                                  /     \
                             No  /       \  Yes
                                ▼         ▼
                        [DirectApproval]  [ApprovalPolicyFactory]
                                |                /       \
                            CONFIRMED           /         \
                                        ROLE_MANAGER    ROLE_ADMIN
                                             ▼               ▼
                                      Department Match   Enterprise
                                      PENDING_APPROVAL   PENDING_APPROVAL
```

- **`DirectApprovalPolicy`**: Instantly approves non-restricted spaces.
- **`ManagerApprovalPolicy`**: Requires sign-off from a manager belonging to the matching department (`ROLE_MANAGER`).
- **`AdminApprovalPolicy`**: Global authority (`ROLE_ADMIN`) able to approve, reject, or override any booking company-wide.

---

## 5. No-Show Mitigation & Scheduled Auto-Release

One of the largest hidden productivity costs in enterprises is **"Ghost Bookings"**—rooms reserved on calendars where the organizer fails to show up, preventing others from utilizing empty rooms.

### The ±15-Minute Check-in Window
- An organizer can check in to an upcoming meeting starting **15 minutes before** the scheduled start time, up until **15 minutes after** start time:
  $$\text{CheckIn Window} = [T_{\text{start}} - 15\,\text{min},\, T_{\text{start}} + 15\,\text{min}]$$
- Calling `POST /api/v1/bookings/{id}/checkin` transitions the booking from `CONFIRMED` to `CHECKED_IN`.

### Automated Background Janitor (`@Scheduled`)
The `AutoReleaseScheduler` runs every minute (`fixedRate = 60000`):
1. Queries all bookings with `status = 'CONFIRMED'`.
2. Identifies reservations where `currentTime > startTime + 15 minutes` and no check-in occurred.
3. Automatically transitions the booking to `CANCELLED` with a cancellation reason: `AUTO_RELEASED_NO_SHOW`.
4. The resource becomes immediately available in the catalog and calendar grid for opportunistic ad-hoc bookings.

---

## 6. Real-Time Availability & Java Stream Analytics

### Continuous Availability Grid
Rather than forcing users to guess open time slots, `GET /api/v1/bookings/availability?resourceId={id}&date=YYYY-MM-DD` computes the resource's operational schedule (08:00 to 20:00):
1. Retrieves all confirmed bookings for that date.
2. Slices the business day into hour-by-hour intervals.
3. Returns each slot tagged as `AVAILABLE` or `OCCUPIED` along with existing booking titles, allowing instant visual grid rendering.

### In-Memory Java Stream Analytics Engine
The `ReportService` computes enterprise utilization without heavy ETL pipelines:
- **Utilization Rate**: $\frac{\sum \text{Hours Booked}}{\text{Total Available Business Hours}} \times 100\%$
- **Peak Usage Hours**: Streams all active booking time slots, expands them into 1-hour buckets, and groups by hour using `Collectors.groupingBy(LocalDateTime::getHour, Collectors.counting())`.
- **Cancellation Ratios**: Computes user-initiated cancellations vs automated no-show releases to highlight departments with frequent ghost meetings.

---

## 7. Distributed Security & Zero-Trust Invariants

BookMg secures inter-service and external traffic using **JJWT 0.12.6** and RFC 7519 standards:
1. **Stateless Authentication**: Login via `POST /api/v1/auth/login` generates an HMAC-SHA256 signed JWT containing `userId`, `email`, and `roles`.
2. **Gateway Verification**: The `api-gateway` decodes the token, verifies cryptographic integrity, validates expiration, and extracts claims.
3. **Internal Identity Propagation**: The Gateway injects trusted upstream headers into forwarded requests:
   - `X-User-Id`
   - `X-User-Email`
   - `X-User-Role`
4. **Defense in Depth**: Downstream services (`resource-service`, `booking-service`) also feature their own `JwtAuthenticationFilter` and `SecurityConfig`, ensuring services cannot be spoofed even if accessed inside the private network.
5. **CORS Configuration**: The Gateway enforces centralized CORS policies permitting methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`), credentials, and authorization headers from the web client.

---

## 8. Summary Table of Microservices

| Service | Port | Database | Primary Responsibility |
|:---|:---:|:---:|:---|
| **api-gateway** | `8080` | None (Stateless) | JWT Auth Gateway Filter, Route dispatch, CORS, Swagger UI aggregation |
| **auth-service** | `8081` | `auth_db` | User identity, BCrypt passwords, JWT minting, RBAC directory |
| **resource-service** | `8082` | `resource_db` | Meeting rooms, equipment, capacity, amenities, JPA dynamic specification |
| **booking-service** | `8083` | `booking_db` | Overlap detection, recurrence engine, approval workflows, auto-release daemon, analytics |
| **frontend** | `5173` | Local Storage | Glassmorphic React 18 SPA, catalog, calendar grid, approvals, metrics |

---

*BookMg Enterprise Architectural Manual — Verified on Spring Cloud 2023.0.3 & Java 17 LTS.*
