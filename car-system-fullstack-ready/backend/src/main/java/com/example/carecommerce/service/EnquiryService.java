package com.example.carecommerce.service;

import com.example.carecommerce.model.Enquiry;
import com.example.carecommerce.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class EnquiryService {
    private static final Set<String> ALLOWED_STATUSES = Set.of("NEW", "CONTACTED", "TEST_DRIVE_SCHEDULED", "CLOSED");

    private final EnquiryRepository repo;
    private final UserRepository userRepo;
    private final CarRepository carRepo;

    public EnquiryService(EnquiryRepository repo, UserRepository userRepo, CarRepository carRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.carRepo = carRepo;
    }

    public List<Enquiry> getAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public List<Enquiry> getMine(String email) {
        Long uid = userRepo.findByEmailIgnoreCase(email).orElseThrow(() -> new IllegalArgumentException("User not found.")).getId();
        return repo.findByUserIdOrderByCreatedAtDesc(uid);
    }

    public Enquiry create(String email, Enquiry e) {
        if (e.getCarId() == null) {
            throw new IllegalArgumentException("Car ID is required.");
        }
        var user = userRepo.findByEmailIgnoreCase(email).orElseThrow(() -> new IllegalArgumentException("User not found."));
        carRepo.findById(e.getCarId()).orElseThrow(() -> new NoSuchElementException("Car not found."));

        e.setId(null);
        e.setUserId(user.getId());
        String customName = e.getName() != null && !e.getName().isBlank() ? e.getName().trim() : user.getName();
        String customPhone = e.getPhone() != null && !e.getPhone().isBlank() ? e.getPhone().trim() : user.getPhone();
        String customMessage = e.getMessage() != null && !e.getMessage().isBlank()
            ? e.getMessage().trim()
            : "I am interested in this car. Please contact me.";
        e.setName(customName);
        e.setEmail(user.getEmail());
        e.setPhone(customPhone);
        e.setMessage(customMessage);
        e.setStatus("NEW");
        return repo.save(e);
    }

    public Enquiry updateStatus(Long id, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required.");
        }
        String normalized = status.trim().toUpperCase();
        if (!ALLOWED_STATUSES.contains(normalized)) {
            throw new IllegalArgumentException("Invalid enquiry status: " + status);
        }
        Enquiry e = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Enquiry not found."));
        e.setStatus(normalized);
        return repo.save(e);
    }
}
