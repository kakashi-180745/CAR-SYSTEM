package com.example.carecommerce.service;

import com.example.carecommerce.model.Car;
import com.example.carecommerce.repository.CarRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class CarService {
    private final CarRepository repo;
    public CarService(CarRepository repo){this.repo=repo;}

    public List<Car> getAllCars(){return repo.findAll();}
    public Car getCarById(Long id){return repo.findById(id).orElseThrow(()->new IllegalArgumentException("Car not found."));}
    public Car addCar(Car car){return repo.save(car);}
    public Car updateCar(Long id, Car input){
        Car c=getCarById(id);
        c.setName(input.getName()); c.setBrand(input.getBrand()); c.setModel(input.getModel()); c.setPrice(input.getPrice()); c.setYear(input.getYear());
        c.setFuelType(input.getFuelType()); c.setTransmission(input.getTransmission()); c.setBodyType(input.getBodyType());
        c.setMileage(input.getMileage()); c.setDescription(input.getDescription()); c.setImageUrl(input.getImageUrl()); c.setMarketCountry(input.getMarketCountry()); c.setCurrency(input.getCurrency()); c.setMarketPrice(input.getMarketPrice()); c.setAvailable(input.getAvailable());
        return repo.save(c);
    }
    public void deleteCar(Long id){repo.deleteById(id);}
    public List<Car> search(String q,String brand,String fuelType,String transmission,BigDecimal maxPrice){
        return repo.findAll().stream().filter(c->
            q==null || q.isBlank() ||
            (c.getBrand()+" "+c.getModel()).toLowerCase(Locale.ROOT).contains(q.toLowerCase(Locale.ROOT))
        ).filter(c->brand==null||brand.isBlank()||(c.getBrand()!=null && c.getBrand().equalsIgnoreCase(brand)))
        .filter(c->fuelType==null||fuelType.isBlank()||(c.getFuelType()!=null && c.getFuelType().equalsIgnoreCase(fuelType)))
        .filter(c->transmission==null||transmission.isBlank()||(c.getTransmission()!=null && c.getTransmission().equalsIgnoreCase(transmission)))
        .filter(c->maxPrice==null||c.getPrice().compareTo(maxPrice)<=0).toList();
    }
}
