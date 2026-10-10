package com.bookmg.core;

import com.bookmg.core.model.Booking;
import com.bookmg.core.model.Resource;
import com.bookmg.core.model.User;
import com.bookmg.core.repository.InMemoryRepository;
import com.bookmg.core.service.ApprovalService;
import com.bookmg.core.service.BookingService;
import com.bookmg.core.service.ResourceService;
import com.bookmg.core.service.UserService;
import com.bookmg.core.ui.ConsoleMenu;
import com.bookmg.core.util.DataInitializer;

import java.util.Scanner;

/**
 * Main application entry point for the BookMg Core Java application.
 * Bootstraps repositories, services, seed data, and initiates the resilient console menu.
 */
public class BookMgApplication {

    public static void main(String[] args) {
        // Initialize Repositories
        InMemoryRepository<User> userRepo = new InMemoryRepository<>();
        InMemoryRepository<Resource> resourceRepo = new InMemoryRepository<>();
        InMemoryRepository<Booking> bookingRepo = new InMemoryRepository<>();

        // Seed Sample Enterprise Data
        DataInitializer.initialize(userRepo, resourceRepo);

        // Instantiate Services
        UserService userService = new UserService(userRepo);
        ResourceService resourceService = new ResourceService(resourceRepo);
        BookingService bookingService = new BookingService(bookingRepo, resourceService, userService);
        ApprovalService approvalService = new ApprovalService(bookingRepo);

        // Launch Resilient Interactive Console Menu
        Scanner scanner = new Scanner(System.in);
        ConsoleMenu menu = new ConsoleMenu(bookingService, resourceService, userService, approvalService, scanner);
        menu.start();
    }
}
