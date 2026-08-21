package com.example.carecommerce.controller;

import com.example.carecommerce.model.Wishlist;
import com.example.carecommerce.service.WishlistService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    private final WishlistService service;
    public WishlistController(WishlistService service){this.service=service;}
    @GetMapping public List<Wishlist> mine(Principal p){return service.getForUser(p.getName());}
    @PostMapping("/{carId}") public Wishlist add(@PathVariable Long carId,Principal p){return service.add(p.getName(),carId);}
    @DeleteMapping("/{carId}") public void remove(@PathVariable Long carId,Principal p){service.remove(p.getName(),carId);}
}
