package com.example.carecommerce.service;

import com.example.carecommerce.model.Car;
import com.example.carecommerce.repository.CarRepository;
import com.example.carecommerce.repository.CartItemRepository;
import com.example.carecommerce.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

@Service
public class CarService {
    private final CarRepository repo;
    private final CartItemRepository cartRepo;
    private final WishlistRepository wishlistRepo;

    public CarService(CarRepository repo, CartItemRepository cartRepo, WishlistRepository wishlistRepo) {
        this.repo = repo;
        this.cartRepo = cartRepo;
        this.wishlistRepo = wishlistRepo;
    }

    public List<Car> getAllCars() {
        return repo.findAll();
    }

    public Car getCarById(Long id) {
        return repo.findById(id).orElseThrow(() -> new NoSuchElementException("Car not found."));
    }

    public Car addCar(Car car) {
        validateAndNormalize(car);
        car.setId(null);
        return repo.save(car);
    }

    public Car updateCar(Long id, Car input) {
        Car c = getCarById(id);
        validateAndNormalize(input);
        c.setName(input.getName());
        c.setBrand(input.getBrand());
        c.setModel(input.getModel());
        c.setPrice(input.getPrice());
        c.setYear(input.getYear());
        c.setFuelType(input.getFuelType());
        c.setTransmission(input.getTransmission());
        c.setBodyType(input.getBodyType());
        c.setMileage(input.getMileage());
        c.setDescription(input.getDescription());
        c.setImageUrl(input.getImageUrl());
        c.setMarketCountry(input.getMarketCountry());
        c.setCurrency(input.getCurrency());
        c.setMarketPrice(input.getMarketPrice());
        c.setAvailable(input.getAvailable() != null ? input.getAvailable() : true);
        return repo.save(c);
    }

    @Transactional
    public void deleteCar(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Car not found.");
        }
        cartRepo.deleteByCarId(id);
        wishlistRepo.deleteByCarId(id);
        repo.deleteById(id);
    }

    public List<Car> search(
        String q,
        String brand,
        String fuelType,
        String transmission,
        String bodyType,
        String country,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Boolean available
    ) {
        String needle = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return repo.findAll().stream()
            .filter(c -> {
                if (needle.isEmpty()) return true;
                String haystack = String.join(" ",
                    safe(c.getName()),
                    safe(c.getBrand()),
                    safe(c.getModel()),
                    safe(c.getBodyType()),
                    safe(c.getFuelType()),
                    safe(c.getMarketCountry())
                ).toLowerCase(Locale.ROOT);
                return haystack.contains(needle);
            })
            .filter(c -> brand == null || brand.isBlank() || (c.getBrand() != null && c.getBrand().equalsIgnoreCase(brand.trim())))
            .filter(c -> fuelType == null || fuelType.isBlank() || (c.getFuelType() != null && c.getFuelType().equalsIgnoreCase(fuelType.trim())))
            .filter(c -> transmission == null || transmission.isBlank() || (c.getTransmission() != null && c.getTransmission().equalsIgnoreCase(transmission.trim())))
            .filter(c -> bodyType == null || bodyType.isBlank() || (c.getBodyType() != null && c.getBodyType().equalsIgnoreCase(bodyType.trim())))
            .filter(c -> country == null || country.isBlank() || (c.getMarketCountry() != null && c.getMarketCountry().equalsIgnoreCase(country.trim())))
            .filter(c -> minPrice == null || (c.getPrice() != null && c.getPrice().compareTo(minPrice) >= 0))
            .filter(c -> maxPrice == null || (c.getPrice() != null && c.getPrice().compareTo(maxPrice) <= 0))
            .filter(c -> available == null || Boolean.valueOf(available).equals(c.getAvailable()))
            .toList();
    }

    private void validateAndNormalize(Car car) {
        if (car.getBrand() == null || car.getBrand().isBlank()) {
            throw new IllegalArgumentException("Brand is required.");
        }
        if (car.getModel() == null || car.getModel().isBlank()) {
            throw new IllegalArgumentException("Model is required.");
        }
        if (car.getPrice() == null || car.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero.");
        }
        car.setBrand(car.getBrand().trim());
        car.setModel(car.getModel().trim());
        if (car.getName() == null || car.getName().isBlank()) {
            car.setName(car.getBrand() + " " + car.getModel());
        } else {
            car.setName(car.getName().trim());
        }
        if (car.getAvailable() == null) {
            car.setAvailable(true);
        }
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }
}
