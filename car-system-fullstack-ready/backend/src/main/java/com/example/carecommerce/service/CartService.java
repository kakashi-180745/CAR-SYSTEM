package com.example.carecommerce.service;

import com.example.carecommerce.model.CartItem;
import com.example.carecommerce.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CartService {
    private final CartItemRepository repo; private final UserRepository users; private final CarRepository cars;
    public CartService(CartItemRepository repo,UserRepository users,CarRepository cars){this.repo=repo;this.users=users;this.cars=cars;}
    public List<CartItem> get(String email){return repo.findByUserId(users.findByEmailIgnoreCase(email).orElseThrow().getId());}
    public CartItem add(String email,Long carId,Integer qty){
        Long uid=users.findByEmailIgnoreCase(email).orElseThrow().getId();cars.findById(carId).orElseThrow(()->new IllegalArgumentException("Car not found."));
        CartItem c=repo.findByUserIdAndCarId(uid,carId).orElseGet(()->{CartItem x=new CartItem();x.setUserId(uid);x.setCarId(carId);x.setQuantity(0);return x;});
        c.setQuantity(Math.max(1,c.getQuantity()+Math.max(1,qty==null?1:qty)));return repo.save(c);
    }
    public void remove(String email,Long carId){Long uid=users.findByEmailIgnoreCase(email).orElseThrow().getId();repo.findByUserIdAndCarId(uid,carId).ifPresent(repo::delete);}
}
