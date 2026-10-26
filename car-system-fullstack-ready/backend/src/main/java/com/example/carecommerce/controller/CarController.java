package com.example.carecommerce.controller;

import com.example.carecommerce.model.Car;
import com.example.carecommerce.service.CarService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/cars")
public class CarController {
    private final CarService service;

    public CarController(CarService service) {
        this.service = service;
    }

    @GetMapping
    public List<Car> all(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String brand,
        @RequestParam(required = false) String fuelType,
        @RequestParam(required = false) String transmission,
        @RequestParam(required = false) String bodyType,
        @RequestParam(required = false) String country,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) Boolean available
    ) {
        if (q == null && brand == null && fuelType == null && transmission == null
            && bodyType == null && country == null && minPrice == null && maxPrice == null && available == null) {
            return service.getAllCars();
        }
        return service.search(q, brand, fuelType, transmission, bodyType, country, minPrice, maxPrice, available);
    }

    @GetMapping("/{id}")
    public Car one(@PathVariable Long id) {
        return service.getCarById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Car add(@RequestBody Car c) {
        return service.addCar(c);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Car update(@PathVariable Long id, @RequestBody Car c) {
        return service.updateCar(id, c);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteCar(id);
        return ResponseEntity.noContent().build();
    }
}
