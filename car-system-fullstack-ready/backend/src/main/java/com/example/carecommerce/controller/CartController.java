package com.example.carecommerce.controller;

import com.example.carecommerce.model.CartItem;
import com.example.carecommerce.service.CartService;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService service;
    public CartController(CartService service){this.service=service;}
    @GetMapping public List<CartItem> mine(Principal p){return service.get(p.getName());}
    @PostMapping("/{carId}") public CartItem add(@PathVariable Long carId,@RequestBody(required=false) Map<String,Integer> body,Principal p){
        return service.add(p.getName(),carId,body==null?1:body.getOrDefault("quantity",1));
    }
    @DeleteMapping("/{carId}") public void remove(@PathVariable Long carId,Principal p){service.remove(p.getName(),carId);}
}
