package com.example.carecommerce.service;

import com.example.carecommerce.model.Wishlist;
import com.example.carecommerce.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepo;
    private final UserRepository userRepo;
    private final CarRepository carRepo;
    public WishlistService(WishlistRepository w,UserRepository u,CarRepository c){wishlistRepo=w;userRepo=u;carRepo=c;}
    public List<Wishlist> getForUser(String email){
        Long uid=userRepo.findByEmailIgnoreCase(email).orElseThrow().getId();
        return wishlistRepo.findByUserId(uid);
    }
    public Wishlist add(String email,Long carId){
        Long uid=userRepo.findByEmailIgnoreCase(email).orElseThrow().getId();
        carRepo.findById(carId).orElseThrow(()->new IllegalArgumentException("Car not found."));
        return wishlistRepo.findByUserIdAndCarId(uid,carId).orElseGet(()->{
            Wishlist w=new Wishlist();w.setUserId(uid);w.setCarId(carId);return wishlistRepo.save(w);
        });
    }
    public void remove(String email,Long carId){
        Long uid=userRepo.findByEmailIgnoreCase(email).orElseThrow().getId();
        wishlistRepo.findByUserIdAndCarId(uid,carId).ifPresent(wishlistRepo::delete);
    }
}
