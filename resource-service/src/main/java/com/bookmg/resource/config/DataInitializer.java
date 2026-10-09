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
                            .restricted(true)
                            .active(true)
                            .description("Large keynote auditorium with theater seating, dynamic lighting, and broadcast production.")
                            .features(Set.of("Stage Lighting", "Wireless Mics", "Dual Cinema Projectors", "Live Broadcast Deck"))
                            .build(),

                    Resource.builder()
                            .name("Executive Boardroom Beta")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(18)
                            .location("HQ Tower, Floor 8")
                            .restricted(true)
                            .active(true)
                            .description("Secondary executive boardroom with dual 85-inch displays, Cisco Webex, and acoustic damping.")
                            .features(Set.of("Dual Display", "Smart Whiteboard", "Surround Audio", "Catering Station"))
                            .build(),

                    Resource.builder()
                            .name("Seattle Sky Boardroom")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(24)
                            .location("Cloud Tower, Floor 22")
                            .restricted(true)
                            .active(true)
                            .description("High-elevation panorama boardroom for executive committee and partner summits.")
                            .features(Set.of("Dual Display", "4K Video Conference", "Catering Station", "Surround Audio"))
                            .build(),

                    Resource.builder()
                            .name("Mountain View Pavilion")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(22)
                            .location("Building 43, Floor 4")
                            .restricted(true)
                            .active(true)
                            .description("Spacious conference suite with direct campus views and modular team setups.")
                            .features(Set.of("4K Video Conference", "Smart Whiteboard", "Dual Display"))
                            .build(),

                    Resource.builder()
                            .name("Turing Council Chamber")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(16)
                            .location("Research Quad, Floor 3")
                            .restricted(true)
                            .active(true)
                            .description("Specialized academic and technical advisory boardroom.")
                            .features(Set.of("Smart Whiteboard", "4K Video Conference", "Dual Display"))
                            .build(),

                    Resource.builder()
                            .name("Kepler Amphitheater")
                            .type(ResourceType.CONFERENCE_HALL)
                            .capacity(120)
                            .location("West Wing, Floor 1")
                            .restricted(true)
                            .active(true)
                            .description("Tiered amphitheater for technical lectures and product showcases.")
                            .features(Set.of("Stage Lighting", "Wireless Mics", "Dual Cinema Projectors"))
                            .build(),

                    Resource.builder()
                            .name("Apollo Town Hall")
                            .type(ResourceType.CONFERENCE_HALL)
                            .capacity(200)
                            .location("Commons Pavilion, Ground Floor")
                            .restricted(true)
                            .active(true)
                            .description("Flagship campus hall for company-wide all-hands and global stream events.")
                            .features(Set.of("Live Broadcast Deck", "Dual Cinema Projectors", "Stage Lighting", "Wireless Mics"))
                            .build(),

                    Resource.builder()
                            .name("Aurora Showcase Theater")
                            .type(ResourceType.CONFERENCE_HALL)
                            .capacity(80)
                            .location("Innovation Center, Floor 2")
                            .restricted(true)
                            .active(true)
                            .description("Immersive cinema presentation space for customer executive briefings.")
                            .features(Set.of("4K Video Conference", "Surround Audio", "Stage Lighting"))
                            .build(),

                    Resource.builder()
                            .name("Ada Lovelace Keynote Hall")
                            .type(ResourceType.CONFERENCE_HALL)
                            .capacity(100)
                            .location("Engineering Hub, Ground Floor")
                            .restricted(true)
                            .active(true)
                            .description("Open keynote arena with broadcast integration and wireless audience audio.")
                            .features(Set.of("Wireless Mics", "Stage Lighting", "Dual Display"))
                            .build(),

                    Resource.builder()
                            .name("Dynamo Pod 3A")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(4)
                            .location("Building A, Floor 3")
                            .restricted(false)
                            .active(true)
                            .description("Compact focus room for pair programming and 1-on-1 sprint syncs.")
                            .features(Set.of("TV Screen", "Magnetic Whiteboard"))
                            .build(),

                    Resource.builder()
                            .name("Dynamo Pod 3B")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(4)
                            .location("Building A, Floor 3")
                            .restricted(false)
                            .active(true)
                            .description("Soundproof telephone and private meeting pod.")
                            .features(Set.of("TV Screen", "Conference Phone"))
                            .build(),

                    Resource.builder()
                            .name("Lambda Brainstorming Studio")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(8)
                            .location("Building C, Floor 1")
                            .restricted(false)
                            .active(true)
                            .description("Design thinking room with wall-to-wall magnetic whiteboards and movable lounge seating.")
                            .features(Set.of("Magnetic Whiteboard", "TV Screen", "Conference Phone"))
                            .build(),

                    Resource.builder()
                            .name("Pixel Creative Huddle")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(6)
                            .location("Design Studio, Floor 4")
                            .restricted(false)
                            .active(true)
                            .description("Color-calibrated creative suite for UX design reviews and art direction.")
                            .features(Set.of("Dual Display", "Magnetic Whiteboard"))
                            .build(),

                    Resource.builder()
                            .name("Prime Collaboration Space")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(10)
                            .location("East Wing, Floor 3")
                            .restricted(false)
                            .active(true)
                            .description("Departmental planning room with interactive touchscreen and digital whiteboard.")
                            .features(Set.of("Smart Whiteboard", "TV Screen", "Conference Phone"))
                            .build(),

                    Resource.builder()
                            .name("Nexus Sprint Room")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(10)
                            .location("Tech Hub, Floor 2")
                            .restricted(false)
                            .active(true)
                            .description("Dedicated agile sprint war room with Kanban walls and screen share.")
                            .features(Set.of("TV Screen", "Magnetic Whiteboard"))
                            .build(),

                    Resource.builder()
                            .name("Matrix Strategy Pod")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(6)
                            .location("Building D, Floor 2")
                            .restricted(false)
                            .active(true)
                            .description("Quiet team space equipped for remote hybrid sync meetings.")
                            .features(Set.of("TV Screen", "Conference Phone", "Magnetic Whiteboard"))
                            .build(),

                    Resource.builder()
                            .name("Synergy Huddle 4C")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(5)
                            .location("Building A, Floor 4")
                            .restricted(false)
                            .active(true)
                            .description("Fast drop-in meeting pod for ad-hoc conversations.")
                            .features(Set.of("TV Screen", "Magnetic Whiteboard"))
                            .build(),

                    Resource.builder()
                            .name("Silicon Validation Lab")
                            .type(ResourceType.LAB)
                            .capacity(10)
                            .location("Fab Building, Floor 2")
                            .restricted(true)
                            .active(true)
                            .description("Semiconductor testing workbench with thermal chambers, probe stations, and logic analyzers.")
                            .features(Set.of("Oscilloscopes", "ESD Protection", "High-Performance Compute"))
                            .build(),

                    Resource.builder()
                            .name("Robotics & Drone Flight Testbed")
                            .type(ResourceType.LAB)
                            .capacity(16)
                            .location("High-Bay Facility, Floor 1")
                            .restricted(true)
                            .active(true)
                            .description("Indoor netted testing cage for autonomous robotics and telemetry recording.")
                            .features(Set.of("High-Performance Compute", "Component Dispensers", "3D Printers"))
                            .build(),

                    Resource.builder()
                            .name("RF & Microwave Anechoic Chamber")
                            .type(ResourceType.LAB)
                            .capacity(6)
                            .location("Antenna Range, Sub-Level 2")
                            .restricted(true)
                            .active(true)
                            .description("Full radiation isolation chamber for 5G/6G and Wi-Fi antenna pattern verification.")
                            .features(Set.of("Oscilloscopes", "ESD Protection"))
                            .build(),

                    Resource.builder()
                            .name("Chemistry & Materials Testing Lab")
                            .type(ResourceType.LAB)
                            .capacity(8)
                            .location("Science Block, Floor 3")
                            .restricted(true)
                            .active(true)
                            .description("Chemical synthesis workbench equipped with certified fume hood and safety eyewash.")
                            .features(Set.of("Cryostat Setup", "Gas Purge Station", "ESD Protection"))
                            .build(),

                    Resource.builder()
                            .name("AI GPU Supercluster Lab Bench")
                            .type(ResourceType.LAB)
                            .capacity(10)
                            .location("Data Center Annex, Floor 1")
                            .restricted(true)
                            .active(true)
                            .description("High-performance liquid-cooled GPU workstation cluster for model training.")
                            .features(Set.of("High-Performance Compute", "Dual Display"))
                            .build(),

                    Resource.builder()
                            .name("Bio-Sensors & Cleanroom Facility")
                            .type(ResourceType.LAB)
                            .capacity(8)
                            .location("Bio-Tech Wing, Floor 2")
                            .restricted(true)
                            .active(true)
                            .description("Class 10,000 cleanroom bench for precision sensor packaging.")
                            .features(Set.of("Gas Purge Station", "ESD Protection"))
                            .build(),

                    Resource.builder()
                            .name("Keysight 40GHz Spectrum Analyzer")
                            .type(ResourceType.EQUIPMENT)
                            .capacity(1)
                            .location("RF Test Equipment Pool, Locker 8")
                            .restricted(true)
                            .active(true)
                            .description("High-frequency calibrated RF analyzer for microwave hardware validation.")
                            .features(Set.of("Portable", "HDMI 2.1"))
                            .build(),

                    Resource.builder()
                            .name("Dual RTX A6000 GPU Mobile Rig")
                            .type(ResourceType.EQUIPMENT)
                            .capacity(1)
                            .location("Deep Learning Staging Rack")
                            .restricted(true)
                            .active(true)
                            .description("Portable AI workstation flight case for on-prem inference trials.")
                            .features(Set.of("Workstation PC", "Portable"))
                            .build(),

                    Resource.builder()
                            .name("Studio Telepresence Broadcast Cart")
                            .type(ResourceType.EQUIPMENT)
                            .capacity(1)
                            .location("AV Media Services, Room 102")
                            .restricted(false)
                            .active(true)
                            .description("Mobile dual-camera broadcast cart for high-stakes video calls in any room.")
                            .features(Set.of("Portable", "4K HDR", "Wireless Dongle"))
                            .build(),

                    Resource.builder()
                            .name("FLIR High-Speed Thermal Imaging Rig")
                            .type(ResourceType.EQUIPMENT)
                            .capacity(1)
                            .location("Hardware Diagnostics Lab, Locker 5")
                            .restricted(true)
                            .active(true)
                            .description("Calibrated radiometric thermal camera for board-level thermal stress testing.")
                            .features(Set.of("Portable", "Sensor Tripods"))
                            .build(),

                    Resource.builder()
                            .name("Industrial MakerBot 3D Printer")
                            .type(ResourceType.EQUIPMENT)
                            .capacity(1)
                            .location("Prototyping Shop, Bench 2")
                            .restricted(false)
                            .active(true)
                            .description("High-speed dual-extrusion additive manufacturing unit.")
                            .features(Set.of("3D Printers", "Component Dispensers"))
                            .build(),

                    // Additional Enterprise Auditoriums & Keynote Stages (Scale 30+ meeting spaces)
                    Resource.builder()
                            .name("Olympus All-Hands Amphitheater")
                            .type(ResourceType.CONFERENCE_HALL)
                            .capacity(250)
                            .location("Central Campus, East Concourse")
                            .restricted(true)
                            .active(true)
                            .description("Tiered amphitheater for company-wide all-hands, product keynotes, and global town halls.")
                            .features(Set.of("Wireless Mics", "Dual Cinema Projectors", "Stage Lighting", "Surround Audio"))
                            .build(),

                    Resource.builder()
                            .name("Grace Hopper Keynote Stage")
                            .type(ResourceType.CONFERENCE_HALL)
                            .capacity(180)
                            .location("Tech Hub, Ground Floor")
                            .restricted(true)
                            .active(true)
                            .description("Auditorium designed for technical conferences, hackathon finals, and developer symposia.")
                            .features(Set.of("Stage Lighting", "Surround Audio", "Dual Cinema Projectors", "Wireless Mics"))
                            .build(),

                    Resource.builder()
                            .name("Shannon Information Hall")
                            .type(ResourceType.CONFERENCE_HALL)
                            .capacity(140)
                            .location("Building 42, Floor 1")
                            .restricted(true)
                            .active(true)
                            .description("Multi-purpose presentation hall for engineering seminars and global webinars.")
                            .features(Set.of("4K Video Conference", "Wireless Cast", "Surround Audio", "Smart Whiteboard"))
                            .build(),

                    Resource.builder()
                            .name("Curie Colloquium Auditorium")
                            .type(ResourceType.CONFERENCE_HALL)
                            .capacity(110)
                            .location("Research Complex, Floor 1")
                            .restricted(true)
                            .active(true)
                            .description("Academic-style lecture and symposium hall for research breakthroughs and guest lectures.")
                            .features(Set.of("Dual Cinema Projectors", "Wireless Mics", "Surround Audio"))
                            .build(),

                    // Additional Executive Boardrooms
                    Resource.builder()
                            .name("Rainier Vision Boardroom")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(22)
                            .location("Tower 1, Floor 25")
                            .restricted(true)
                            .active(true)
                            .description("High-floor executive boardroom overlooking the city with immersive telepresence.")
                            .features(Set.of("4K Video Conference", "Dual Display", "Smart Whiteboard", "Catering Station"))
                            .build(),

                    Resource.builder()
                            .name("Sun Valley Summit Room")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(18)
                            .location("Executive Wing, Floor 9")
                            .restricted(true)
                            .active(true)
                            .description("Strategic planning suite for C-suite alignment and quarterly business reviews.")
                            .features(Set.of("Surround Audio", "Dual Display", "Smart Whiteboard", "Conference Phone"))
                            .build(),

                    Resource.builder()
                            .name("Charleston Executive Suite")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(16)
                            .location("Bay View Campus, Floor 5")
                            .restricted(true)
                            .active(true)
                            .description("Modern sunlit boardroom with curved panoramic displays and private terrace.")
                            .features(Set.of("4K Video Conference", "Dual Display", "Wireless Cast", "Sound Isolation"))
                            .build(),

                    // Additional Collaboration, War Rooms & Focus Pods
                    Resource.builder()
                            .name("Android Collaboration Studio")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(14)
                            .location("Building 40, Floor 2")
                            .restricted(false)
                            .active(true)
                            .description("Flexible workshop space with movable whiteboard walls and collaborative touch displays.")
                            .features(Set.of("Smart Whiteboard", "TV Screen", "Wireless Cast"))
                            .build(),

                    Resource.builder()
                            .name("Kubernetes Cluster Room")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(12)
                            .location("Cloud Infra Wing, Floor 4")
                            .restricted(false)
                            .active(true)
                            .description("Team war room configured for platform infrastructure syncs and incident post-mortems.")
                            .features(Set.of("Dual Display", "Conference Phone", "Whiteboard"))
                            .build(),

                    Resource.builder()
                            .name("TensorFlow Deep Learning Suite")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(12)
                            .location("AI Research Quad, Floor 3")
                            .restricted(false)
                            .active(true)
                            .description("Dedicated meeting hub for deep learning algorithm and machine intelligence teams.")
                            .features(Set.of("4K Video Conference", "Dual Display", "Smart Whiteboard"))
                            .build(),

                    Resource.builder()
                            .name("Day One Innovation War Room")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(10)
                            .location("Amazonian Hub, Floor 6")
                            .restricted(false)
                            .active(true)
                            .description("High-velocity product launch war room with 360-degree magnetic writable walls.")
                            .features(Set.of("Whiteboard", "Dual Display", "Conference Phone"))
                            .build(),

                    Resource.builder()
                            .name("Borg Platform Strategy Room")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(8)
                            .location("Data Center Ops, Floor 2")
                            .restricted(false)
                            .active(true)
                            .description("Reliability engineering meeting space for operations reviews and architecture design.")
                            .features(Set.of("TV Screen", "Wireless Cast", "Whiteboard"))
                            .build(),

                    Resource.builder()
                            .name("DeepMind Think Tank 5")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(8)
                            .location("Research Complex, Floor 4")
                            .restricted(false)
                            .active(true)
                            .description("Quiet ideation pod shielded for focused research discussions and whiteboard math.")
                            .features(Set.of("Sound Isolation", "Smart Whiteboard", "TV Screen"))
                            .build(),

                    Resource.builder()
                            .name("Chromium Sprint Hub 2B")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(6)
                            .location("Platform Engineering, Floor 3")
                            .restricted(false)
                            .active(true)
                            .description("Scrum room optimized for daily standups, sprint reviews, and pair programming.")
                            .features(Set.of("TV Screen", "Whiteboard", "Conference Phone"))
                            .build(),

                    Resource.builder()
                            .name("Pixel Design Critique Room")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(6)
                            .location("Design Studio, Floor 3")
                            .restricted(false)
                            .active(true)
                            .description("Studio space with color-accurate displays for industrial design and UX critiques.")
                            .features(Set.of("Dual Display", "Magnetic Whiteboard", "Wireless Cast"))
                            .build(),

                    Resource.builder()
                            .name("Apollo Focus Pod 1A")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(4)
                            .location("HQ Tower, Floor 5")
                            .restricted(false)
                            .active(true)
                            .description("Compact acoustic soundproof pod for confidential 1-on-1s and video interviews.")
                            .features(Set.of("TV Screen", "Sound Isolation"))
                            .build()
            );

            resourceRepository.saveAll(seedResources);
            log.info("Successfully seeded {} resources across rooms, labs, and equipment", seedResources.size());
        } else {
            log.info("Resources already exist in catalog database, skipping seeding.");
        }
    }
}
