package com.example.carecommerce.controller;

import com.example.carecommerce.model.CartItem;
import com.example.carecommerce.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }

    @GetMapping
    public List<CartItem> mine(Principal p) {
        return service.get(p.getName());
    }

    @PostMapping("/{carId}")
    public CartItem add(@PathVariable Long carId, @RequestBody(required = false) Map<String, Integer> body, Principal p) {
        return service.add(p.getName(), carId, body == null ? 1 : body.getOrDefault("quantity", 1));
    }

    @PatchMapping("/{carId}")
    public ResponseEntity<CartItem> updateQuantity(@PathVariable Long carId, @RequestBody Map<String, Integer> body, Principal p) {
        Integer qty = body == null ? null : body.get("quantity");
        if (qty == null) {
            throw new IllegalArgumentException("Quantity is required.");
        }
        CartItem updated = service.updateQuantity(p.getName(), carId, qty);
        return updated == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{carId}")
    public ResponseEntity<Void> remove(@PathVariable Long carId, Principal p) {
        service.remove(p.getName(), carId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(Principal p) {
        service.clear(p.getName());
        return ResponseEntity.noContent().build();
    }
}
