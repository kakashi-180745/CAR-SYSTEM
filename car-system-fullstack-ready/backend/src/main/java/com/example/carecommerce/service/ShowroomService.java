package com.example.carecommerce.service;

import com.example.carecommerce.model.Showroom;
import com.example.carecommerce.repository.ShowroomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ShowroomService {
    private final ShowroomRepository repo;

    public ShowroomService(ShowroomRepository repo) {
        this.repo = repo;
    }

    public List<Showroom> getAllShowrooms() {
        return repo.findAll();
    }

    public Showroom getShowroomById(Long id) {
        return repo.findById(id).orElseThrow(() -> new NoSuchElementException("Showroom not found."));
    }

    public Showroom addShowroom(Showroom s) {
        validate(s);
        s.setId(null);
        return repo.save(s);
    }

    public Showroom updateShowroom(Long id, Showroom in) {
        Showroom s = getShowroomById(id);
        validate(in);
        s.setName(in.getName().trim());
        s.setAddress(in.getAddress().trim());
        s.setCity(in.getCity().trim());
        s.setCountry(in.getCountry() != null ? in.getCountry().trim() : null);
        s.setLatitude(in.getLatitude());
        s.setLongitude(in.getLongitude());
        s.setPhone(in.getPhone());
        s.setEmail(in.getEmail());
        s.setBrand(in.getBrand());
        s.setState(in.getState());
        s.setWebsite(in.getWebsite());
        s.setImageUrl(in.getImageUrl());
        return repo.save(s);
    }

    public void deleteShowroom(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Showroom not found.");
        }
        repo.deleteById(id);
    }

    private void validate(Showroom s) {
        if (s.getName() == null || s.getName().isBlank()) {
            throw new IllegalArgumentException("Showroom name is required.");
        }
        if (s.getCity() == null || s.getCity().isBlank()) {
            throw new IllegalArgumentException("City is required.");
        }
        if (s.getAddress() == null || s.getAddress().isBlank()) {
            throw new IllegalArgumentException("Address is required.");
        }
        if (s.getLatitude() == null || s.getLatitude() < -90 || s.getLatitude() > 90) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90.");
        }
        if (s.getLongitude() == null || s.getLongitude() < -180 || s.getLongitude() > 180) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180.");
        }
    }
}
