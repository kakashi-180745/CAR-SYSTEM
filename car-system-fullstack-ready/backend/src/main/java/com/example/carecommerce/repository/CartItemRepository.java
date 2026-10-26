package com.example.carecommerce.repository;

import com.example.carecommerce.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    Optional<CartItem> findByUserIdAndCarId(Long userId, Long carId);
    @Transactional void deleteByCarId(Long carId);
    @Transactional void deleteByUserId(Long userId);
}
