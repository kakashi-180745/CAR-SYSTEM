package com.example.carecommerce.repository;

import com.example.carecommerce.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserId(Long userId);
    Optional<Wishlist> findByUserIdAndCarId(Long userId, Long carId);
    @Transactional void deleteByCarId(Long carId);
    @Transactional void deleteByUserId(Long userId);
}
