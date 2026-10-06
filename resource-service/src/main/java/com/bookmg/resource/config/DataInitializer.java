package com.bookmg.resource.config;

import com.bookmg.resource.model.Resource;
import com.bookmg.resource.model.ResourceType;
import com.bookmg.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    @Override
    public void run(String... args) {
        if (resourceRepository.count() == 0) {
            log.info("Seeding initial resources into resource catalog database...");

            List<Resource> seedResources = List.of(
                    Resource.builder()
                            .name("Executive Boardroom Alpha")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(20)
                            .location("HQ Tower, Floor 8")
                            .restricted(true) // Requires approval
                            .active(true)
                            .description("Executive meeting room equipped with 4K video conferencing, telepresence, and catering station.")
                            .features(Set.of("4K Video Conference", "Smart Whiteboard", "Dual Display", "Catering Station", "Surround Audio"))
                            .build(),

                    Resource.builder()
                            .name("Innovation Huddle 1")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(6)
                            .location("Building B, Floor 2")
                            .restricted(false)
                            .active(true)
                            .description("Agile team huddle room for brainstorming and sprint reviews.")
                            .features(Set.of("TV Screen", "Magnetic Whiteboard", "Conference Phone"))
                            .build(),

                    Resource.builder()
                            .name("Innovation Huddle 2")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(8)
                            .location("Building B, Floor 2")
                            .restricted(false)
                            .active(true)
                            .description("Collaborative meeting space with screen mirroring and webcam.")
                            .features(Set.of("TV Screen", "Whiteboard", "Wireless Cast"))
                            .build(),

                    Resource.builder()
                            .name("Quantum Computing Lab")
                            .type(ResourceType.LAB)
                            .capacity(15)
                            .location("Research Complex, Sub-Level 1")
                            .restricted(true) // Restricted access
                            .active(true)
                            .description("Specialized cryogenic and superconducting experimental computing facility.")
                            .features(Set.of("Cryostat Setup", "ESD Protection", "High-Performance Compute", "Gas Purge Station"))
                            .build(),

                    Resource.builder()
                            .name("Hardware Prototyping Lab")
                            .type(ResourceType.LAB)
                            .capacity(12)
                            .location("Engineering Wing, Floor 1")
                            .restricted(false)
                            .active(true)
                            .description("Electronics workstation with soldering stations, oscilloscopes, and 3D printers.")
                            .features(Set.of("Oscilloscopes", "Soldering Stations", "3D Printers", "Component Dispensers"))
                            .build(),

                    Resource.builder()
                            .name("Sony 4K Laser Cinema Projector")
                            .type(ResourceType.EQUIPMENT)
                            .capacity(1)
                            .location("IT Inventory Cage, Locker 3")
                            .restricted(false)
                            .active(true)
                            .description("High-lumen portable laser projector for keynotes and all-hands demos.")
                            .features(Set.of("Portable", "4K HDR", "HDMI 2.1", "Wireless Dongle"))
                            .build(),

                    Resource.builder()
                            .name("Meta Quest Pro Studio Kit")
                            .type(ResourceType.EQUIPMENT)
                            .capacity(1)
                            .location("AR/VR Research Lab")
                            .restricted(true) // Restricted equipment
                            .active(true)
                            .description("Enterprise mixed reality development headset and full body tracking sensors.")
                            .features(Set.of("VR Headset", "Hand Tracking", "Workstation PC", "Sensor Tripods"))
                            .build(),

                    Resource.builder()
                            .name("Grand Auditorium")
                            .type(ResourceType.CONFERENCE_HALL)
                            .capacity(150)
                            .location("Central Campus, Ground Floor")
                            .restricted(true) // Large space requiring approval
                            .active(true)
                            .description("Large keynote auditorium with theater seating, dynamic lighting, and broadcast production.")
                            .features(Set.of("Stage Lighting", "Wireless Mics", "Dual Cinema Projectors", "Live Broadcast Deck"))
                            .build()
            );

            resourceRepository.saveAll(seedResources);
            log.info("Successfully seeded {} resources across rooms, labs, and equipment", seedResources.size());
        } else {
            log.info("Resources already exist in catalog database, skipping seeding.");
        }
    }
}
