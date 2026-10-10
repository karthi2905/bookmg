package com.bookmg.core.util;

import com.bookmg.core.model.*;
import com.bookmg.core.repository.InMemoryRepository;

/**
 * Utility responsible for bootstrapping default enterprise users, rooms, and equipment.
 */
public class DataInitializer {

    public static void initialize(InMemoryRepository<User> userRepo,
                                  InMemoryRepository<Resource> resourceRepo) {
        // Reset counters to maintain predictable seed IDs
        User.resetCounter(1000);
        Resource.resetCounter(1000);

        // Seed Users
        Admin admin = new Admin("Charlie Admin", "admin@bookmg.com", "IT");
        Manager mgrEng = new Manager("Bob Director", "bob@bookmg.com", "ENGINEERING");
        Manager mgrHr = new Manager("Sarah Lead", "sarah@bookmg.com", "HR");
        Employee empAlice = new Employee("Alice Developer", "alice@bookmg.com", "ENGINEERING");
        Employee empDave = new Employee("Dave Sales", "dave@bookmg.com", "SALES");

        userRepo.save(admin);
        userRepo.save(mgrEng);
        userRepo.save(mgrHr);
        userRepo.save(empAlice);
        userRepo.save(empDave);

        // Seed Resources
        MeetingRoom turing = new MeetingRoom("Turing Room", ResourceType.MEETING_ROOM, 12,
                "Campus B - Floor 2", false, "201", true);
        MeetingRoom lovelace = new MeetingRoom("Lovelace Conference Room", ResourceType.CONFERENCE_ROOM, 20,
                "Campus B - Floor 3", false, "305", true);
        Resource boardroom = new Resource("Executive Boardroom", ResourceType.EXECUTIVE_BOARDROOM, 30,
                "Headquarters - Floor 5", true);
        Resource quantumLab = new Resource("Quantum AI Compute Lab", ResourceType.TRAINING_LAB, 15,
                "Tech Tower - Floor 4", true);
        Equipment projector = new Equipment("4K High-Lumen Laser Projector", ResourceType.AV_EQUIPMENT, 1,
                "IT Asset Depot", false, "SN-4K-9921", true);

        resourceRepo.save(turing);
        resourceRepo.save(lovelace);
        resourceRepo.save(boardroom);
        resourceRepo.save(quantumLab);
        resourceRepo.save(projector);
    }
}
