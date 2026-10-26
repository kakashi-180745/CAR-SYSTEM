package com.example.carecommerce.service;

import com.example.carecommerce.model.CartItem;
import com.example.carecommerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CartService {
    private final CartItemRepository repo;
    private final UserRepository users;
    private final CarRepository cars;

    public CartService(CartItemRepository repo, UserRepository users, CarRepository cars) {
        this.repo = repo;
        this.users = users;
        this.cars = cars;
    }

    public List<CartItem> get(String email) {
        Long uid = getUserId(email);
        return repo.findByUserId(uid);
    }

    public CartItem add(String email, Long carId, Integer qty) {
        Long uid = getUserId(email);
        var car = cars.findById(carId).orElseThrow(() -> new NoSuchElementException("Car not found."));
        if (Boolean.FALSE.equals(car.getAvailable())) {
            throw new IllegalArgumentException("This car is currently not available.");
        }
        CartItem c = repo.findByUserIdAndCarId(uid, carId).orElseGet(() -> {
            CartItem x = new CartItem();
            x.setUserId(uid);
            x.setCarId(carId);
            x.setQuantity(0);
            return x;
        });
        int delta = Math.max(1, qty == null ? 1 : qty);
        c.setQuantity(Math.min(20, Math.max(1, c.getQuantity() + delta)));
        return repo.save(c);
    }

    public CartItem updateQuantity(String email, Long carId, int qty) {
        Long uid = getUserId(email);
        var existing = repo.findByUserIdAndCarId(uid, carId)
            .orElseThrow(() -> new NoSuchElementException("Cart item not found."));
        if (qty <= 0) {
            repo.delete(existing);
            return null;
        }
        existing.setQuantity(Math.min(20, qty));
        return repo.save(existing);
    }

    public void remove(String email, Long carId) {
        Long uid = getUserId(email);
        repo.findByUserIdAndCarId(uid, carId).ifPresent(repo::delete);
    }

    @Transactional
    public void clear(String email) {
        Long uid = getUserId(email);
        repo.deleteByUserId(uid);
    }

    private Long getUserId(String email) {
        return users.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found."))
            .getId();
    }
}
