package com.collaborative.planner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CollaborativeTripPlannerApplication {

    public static void main(String[] args) {
        SpringApplication.run(CollaborativeTripPlannerApplication.class, args);
        System.out.println("=================================================");
        System.out.println("  Collaborative Trip Planner Services Started!   ");
        System.out.println("=================================================");
    }
}
