package com.example.carecommerce.service;

import com.example.carecommerce.model.Wishlist;
import com.example.carecommerce.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepo;
    private final UserRepository userRepo;
    private final CarRepository carRepo;

    public WishlistService(WishlistRepository w, UserRepository u, CarRepository c) {
        wishlistRepo = w;
        userRepo = u;
        carRepo = c;
    }

    public List<Wishlist> getForUser(String email) {
        Long uid = getUserId(email);
        return wishlistRepo.findByUserId(uid);
    }

    public Wishlist add(String email, Long carId) {
        Long uid = getUserId(email);
        carRepo.findById(carId).orElseThrow(() -> new NoSuchElementException("Car not found."));
        return wishlistRepo.findByUserIdAndCarId(uid, carId).orElseGet(() -> {
            Wishlist w = new Wishlist();
            w.setUserId(uid);
            w.setCarId(carId);
            return wishlistRepo.save(w);
        });
    }

    public void remove(String email, Long carId) {
        Long uid = getUserId(email);
        wishlistRepo.findByUserIdAndCarId(uid, carId).ifPresent(wishlistRepo::delete);
    }

    private Long getUserId(String email) {
        return userRepo.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found."))
            .getId();
    }
}
