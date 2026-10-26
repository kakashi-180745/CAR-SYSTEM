package com.example.carecommerce.service;

import com.example.carecommerce.model.Report;
import com.example.carecommerce.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class ReportService {
    private static final Set<String> ALLOWED_STATUSES = Set.of("OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED");

    private final ReportRepository repo;
    private final UserRepository users;
    private final CarRepository cars;
    private final ShowroomRepository showrooms;

    public ReportService(ReportRepository repo, UserRepository users, CarRepository cars, ShowroomRepository showrooms) {
        this.repo = repo;
        this.users = users;
        this.cars = cars;
        this.showrooms = showrooms;
    }

    public List<Report> all() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public List<Report> mine(String email) {
        Long uid = users.findByEmailIgnoreCase(email).orElseThrow(() -> new IllegalArgumentException("User not found.")).getId();
        return repo.findByUserIdOrderByCreatedAtDesc(uid);
    }

    public Report create(String email, Report r) {
        if (r.getSubject() == null || r.getSubject().isBlank()) {
            throw new IllegalArgumentException("Subject is required.");
        }
        if (r.getDescription() == null || r.getDescription().isBlank()) {
            throw new IllegalArgumentException("Description is required.");
        }
        Long uid = users.findByEmailIgnoreCase(email).orElseThrow(() -> new IllegalArgumentException("User not found.")).getId();
        if (r.getCarId() != null) {
            cars.findById(r.getCarId()).orElseThrow(() -> new NoSuchElementException("Car not found."));
        }
        if (r.getShowroomId() != null) {
            showrooms.findById(r.getShowroomId()).orElseThrow(() -> new NoSuchElementException("Showroom not found."));
        }
        r.setId(null);
        r.setUserId(uid);
        r.setIssueType(r.getIssueType() == null || r.getIssueType().isBlank() ? "GENERAL" : r.getIssueType().trim().toUpperCase());
        r.setSubject(r.getSubject().trim());
        r.setDescription(r.getDescription().trim());
        if (r.getImageUrl() != null && r.getImageUrl().isBlank()) {
            r.setImageUrl(null);
        }
        r.setStatus("OPEN");
        r.setAdminResponse(null);
        return repo.save(r);
    }

    public Report update(Long id, String status, String response) {
        Report r = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Report not found."));
        if (status != null && !status.isBlank()) {
            String normalized = status.trim().toUpperCase();
            if (!ALLOWED_STATUSES.contains(normalized)) {
                throw new IllegalArgumentException("Invalid report status: " + status);
            }
            r.setStatus(normalized);
        }
        r.setAdminResponse(response != null ? response.trim() : null);
        return repo.save(r);
    }
}
