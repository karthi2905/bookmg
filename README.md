# BookMg - Enterprise Meeting Room & Resource Booking Platform

A production-grade, microservice-based enterprise resource booking platform built with **Java 17+**, **Spring Boot 3.3.5**, **Spring Cloud 2023.0.3**, **PostgreSQL / H2**, and **React 18 + Vite**.

---

## 1. System Architecture

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

---

## 2. Microservice Modules

| Module | Service | Port | Responsibilities |
|---|---|---|---|
| [`api-gateway`](file:///d:/projects/BookMg/api-gateway) | API Gateway | 8080 | Centralized routing, CORS, JWT token validation & claim injection, OpenAPI aggregation |
| [`auth-service`](file:///d:/projects/BookMg/auth-service) | Auth & User Directory | 8081 | Authentication, JJWT 0.12.6 issuance, users, roles, departments |
| [`resource-service`](file:///d:/projects/BookMg/resource-service) | Resource Service | 8082 | Resource catalog (rooms, labs, equipment), capacities, locations, JPA Specification dynamic filtering |
| [`booking-service`](file:///d:/projects/BookMg/booking-service) | Booking & Approvals | 8083 | Single & recurring bookings, atomic conflict detection, approval policy engine, 15-min auto-release scheduler, Java Streams analytics |
| [`frontend`](file:///d:/projects/BookMg/frontend) | Web App (React) | 5173 | Glassmorphic React 18 SPA: catalog, booking modal, availability grid, my bookings, approvals dashboard, metrics |

---

## 3. Seed Users & Test Credentials

Each service pre-seeds test data automatically on startup for zero-friction testing:

| Email | Password | Role | Department | Access / Privileges |
|---|---|---|---|---|
| `admin@bookmg.com` | `admin123` | `ROLE_ADMIN` | IT | Full enterprise access, resource creation, global approvals |
| `manager@bookmg.com` | `manager123` | `ROLE_MANAGER` | ENGINEERING | Books rooms, approves Engineering department restricted requests |
| `user@bookmg.com` | `user123` | `ROLE_EMPLOYEE` | ENGINEERING | Standard room bookings & calendar views |
| `hr@bookmg.com` | `hr123` | `ROLE_MANAGER` | HR | Books rooms, approves HR department restricted requests |
| `sales@bookmg.com` | `sales123` | `ROLE_EMPLOYEE` | SALES | Standard room bookings & sales meetings |

---

## 4. API Endpoints Overview

All APIs are accessible through the centralized Gateway on `http://localhost:8080`:

### Auth & User Directory (`auth-service`)
- `POST /api/v1/auth/register` - Create new user account
- `POST /api/v1/auth/login` - Authenticate and acquire signed JWT
- `GET /api/v1/auth/me` - Retrieve authenticated user profile
- `GET /api/v1/users` - List users with department filters
- `GET /api/v1/users/{id}` - Retrieve user details by ID

### Resource Catalog (`resource-service`)
- `GET /api/v1/resources` - Dynamic search (filters: `type`, `minCapacity`, `search`, `restricted`)
- `GET /api/v1/resources/{id}` - Get resource details and amenities
- `POST /api/v1/resources` - Create new resource (`ROLE_ADMIN` only)
- `PUT /api/v1/resources/{id}` - Update resource (`ROLE_ADMIN` only)
- `DELETE /api/v1/resources/{id}` - Delete resource (`ROLE_ADMIN` only)

### Bookings, Approvals & Reports (`booking-service`)
- `POST /api/v1/bookings` - Create booking (single or recurring with atomic conflict checking)
- `GET /api/v1/bookings/{id}` - Get booking reservation details
- `GET /api/v1/bookings/my` - List current user's reservations
- `GET /api/v1/bookings/resource/{id}` - List bookings for a resource within time window
- `DELETE /api/v1/bookings/{id}` - Cancel a single booking
- `DELETE /api/v1/bookings/series/{recurrenceGroupId}` - Cancel an entire recurring series
- `POST /api/v1/bookings/{id}/checkin` - Confirm attendance within ±15 min window
- `GET /api/v1/bookings/availability` - Real-time slot availability grid for a date
- `GET /api/v1/approvals/pending` - Pending approval queue for managers & admins
- `POST /api/v1/approvals/{id}/approve` - Approve restricted booking
- `POST /api/v1/approvals/{id}/reject` - Reject restricted booking with note
- `GET /api/v1/reports/utilisation` - Enterprise resource utilization analytics via Java Streams

---

## 5. Quick Start

### Option A: Local Run with In-Memory H2 (Default)
Each service runs independently with zero external dependencies in `h2` mode:

```bash
# 1. Build and test all backend microservices (32 tests)
mvn clean test

# 2. Start services in separate terminals:
mvn spring-boot:run -pl auth-service
mvn spring-boot:run -pl resource-service
mvn spring-boot:run -pl booking-service
mvn spring-boot:run -pl api-gateway

# 3. Start the React Frontend:
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

### Option B: Docker Compose (PostgreSQL Database-per-Service)
```bash
# Package service JARs
mvn clean package -DskipTests

# Start PostgreSQL and all microservices
docker compose up --build -d

# Visit:
# Web UI:       http://localhost:5173
# API Gateway:  http://localhost:8080
# Swagger UI:   http://localhost:8080/swagger-ui.html
```

---

## 6. Implementation Status & Daily Progress

### Day 1: Project Architecture & Backlog Setup
- [x] **PHASE 0: Repo Scaffold, Parent POM, Module Skeletons, Docker-Compose, Database Schemas**
- [x] **Product Backlog & Agile Requirements Analysis (FR1–FR8 User Stories, 36 Story Points, DoD)**

### Day 2: Foundational Microservices
- [x] **PHASE 1: Auth Service (Entities, JWT 0.12.6, Register/Login, Seed Data, Security Filters, Integration Tests)**
- [x] **PHASE 2: Resource Service (Resource Catalog CRUD, Dynamic JPA Specification Filters, Amenities, Integration Tests)**

### Day 3: Core Scheduling, Concurrency & API Gateway
- [x] **PHASE 3: Booking Service Core (TimeSlot record, Entities, Atomic Interval Conflict Detection, Feign Client, Tests)**
- [x] **PHASE 4: Recurrence Strategy & Series Cancellation (Daily, Weekly, Bi-weekly, Monthly with 3-Month Cap)**
- [x] **PHASE 5: Approvals Workflow (Policy Factory, Restricted Assets, Manager/Admin routing)**
- [x] **PHASE 6: Check-in & @Scheduled Auto-Release (±15-min Window, Anti-Ghost-Booking Engine)**
- [x] **PHASE 7: Availability Endpoint & Utilisation Reports (Continuous Grid & Java Streams Analytics)**
- [x] **PHASE 8: API Gateway (Centralized Routing, Reactive JWT Validation, OpenAPI Aggregation)**
- [x] **PHASE 10: Dockerization, CONCEPTS.md Architecture Guide & Microservice Verification**

### Day 4: Core Java Domain Entities & Encapsulation
- [x] **Three Core Domain Models (`User`, `Resource`, `Booking`)**:
  - **Encapsulation & Validation**: All private fields with defensive validation (non-blank names, email validation, positive capacities, time interval validity).
  - **Constructor Chaining**: Chained constructors using `this(...)` to eliminate redundant field initialization.
  - **Static ID Generators**: Synchronized auto-incrementing counters generating sequential enterprise IDs (`USR-1001`, `RES-1001`, `BKG-1001`).
  - **Standard Object Contracts**: Robust `equals()`, `hashCode()`, and `toString()` implementations based on unique identity.
  - **Natural Ordering**: `Booking implements Comparable<Booking>` sorting chronologically by date and start time.
  - **Unit Testing**: 10 comprehensive tests in `Day4EntityModelTest`.

### Day 5: BaseEntity, Role Hierarchy & Strategy Pattern (Feature Branch + PR Merge)
- [x] **Abstract `BaseEntity`**: Foundation class managing `id`, audit timestamps (`createdAt`, `updatedAt`), active state, and common entity identity.
- [x] **Polymorphic Role Hierarchy**:
  - Abstract base `User` with dynamic dispatch methods: `getRole()`, `canApproveBookings()`, `getMaxBookingHours()`, `displayRoleSummary()`.
  - Concrete subclasses: `Employee` (4h cap, non-approver), `Manager` (8h cap, department approver), and `Admin` (24h cap, global approver).
  - Specialized resource subclasses: `MeetingRoom` (room number, video conferencing) and `Equipment` (serial number, portability).
- [x] **Strategy Pattern**:
  - `ApprovalStrategy` interface with `AutoApprovalStrategy` (instant confirmation) and `ManagerApprovalStrategy` (routes restricted rooms to `PENDING_APPROVAL`, respects Admin override).
  - `ApprovalPolicyEngine` dynamic context resolver.
  - `RecurrenceStrategy` with `DailyRecurrenceStrategy` and `WeeklyRecurrenceStrategy`.
- [x] **Git Feature Branch & PR Merge**:
  - Developed on dedicated branch `feature/day-5-role-hierarchy-strategy`.
  - Merged into `main` via PR simulation (`git merge --no-ff`) with merge commit `7432387`, preserving full branch history.
  - **Unit Testing**: 8 tests in `Day5HierarchyAndStrategyTest`.

### Day 6 (Today): Custom Exception Package, 2 Business Rules & Resilient Console Menu
- [x] **Custom Exception Hierarchy (`com.bookmg.core.exception`)**:
  - Checked Exception: `BookingConflictException` (holds conflicting reservation ID, resource ID, and requested slot).
  - Unchecked Exceptions: `InvalidBookingException` (holds error code and policy rule reason), `ResourceNotFoundException`, and `UnauthorizedBookingException`.
- [x] **Enforcement of 2 Core Business Rules in `BookingService`**:
  - **Business Rule 1 (Double-Booking / Interval Overlap Conflict)**:
    Interval overlap check ($S_1 < E_2 \land E_1 > S_2$). Adjacent slots accepted without conflict; overlaps reject with checked `BookingConflictException`.
  - **Business Rule 2 (Operational Bounds, Duration & Role Caps)**:
    Enforces business operating hours (08:00–20:00), non-past dates, 90-day advance ceiling, minimum 15-minute slot duration, and role-based maximum reservation hours. Violations reject with unchecked `InvalidBookingException`.
- [x] **Interactive Console Menu with Full Error Recovery (`ConsoleMenu`)**:
  - Robust menu loop (Options 1–7, 0 to exit).
  - Multi-tier `try-catch` blocks catching `BookingConflictException`, `InvalidBookingException`, `ResourceNotFoundException`, `UnauthorizedBookingException`, and `DateTimeParseException`.
  - Safe scanner buffer clearing preventing infinite loops.
  - **The menu recovers after any error**: Displays formatted error banners and returns gracefully to the main menu prompt without crashing or dropping state.
  - Option 7 automated demonstration exercises all 5 failure modes and proves immediate menu recovery.
- [x] **Execution Script**: Dedicated `run_core_menu.bat` and `mvn exec:java -pl bookmg-core` for 1-click launch.
- [x] **Unit Testing**: 12 tests in `Day6ExceptionsAndBusinessRulesTest` (30 total core tests passing).

---

## 7. Running the Core Java Application (Days 4–6)

```bash
# Compile and run all 30 Core Java unit tests:
mvn clean test -pl bookmg-core

# Launch the interactive error-recovering console menu:
mvn exec:java -pl bookmg-core

# Or run the Windows batch script:
.\run_core_menu.bat
```

For in-depth architectural and concurrency details, please consult [CONCEPTS.md](file:///d:/projects/BookMg/CONCEPTS.md).
