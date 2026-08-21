package com.example.carecommerce.repository;
import com.example.carecommerce.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CarRepository extends JpaRepository<Car,Long> {}
