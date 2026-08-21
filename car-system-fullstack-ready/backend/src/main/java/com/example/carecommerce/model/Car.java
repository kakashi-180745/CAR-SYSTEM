package com.example.carecommerce.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cars")
public class Car {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 150) private String name;
    @Column(nullable = false, length = 80) private String brand;
    @Column(nullable = false, length = 100) private String model;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal price;
    private Integer year;
    @Column(length = 30) private String fuelType;
    @Column(length = 30) private String transmission;
    @Column(length = 40) private String bodyType;
    private Double mileage;
    @Column(length = 2000) private String description;
    @Column(length = 1000) private String imageUrl;
    @Column(length = 100) private String marketCountry;
    @Column(length = 10) private String currency;
    @Column(precision = 16, scale = 2) private BigDecimal marketPrice;
    @Column(nullable = false) private Boolean available = true;
    @Column(nullable = false) private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); if (available == null) available = true; }

    public Car() {}

    public Long getId(){return id;} public String getName(){return name;} public String getBrand(){return brand;} public String getModel(){return model;}
    public BigDecimal getPrice(){return price;} public Integer getYear(){return year;} public String getFuelType(){return fuelType;}
    public String getTransmission(){return transmission;} public String getBodyType(){return bodyType;} public Double getMileage(){return mileage;}
    public String getDescription(){return description;} public String getImageUrl(){return imageUrl;} public String getMarketCountry(){return marketCountry;} public String getCurrency(){return currency;} public BigDecimal getMarketPrice(){return marketPrice;} public Boolean getAvailable(){return available;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setId(Long v){id=v;} public void setName(String v){name=v;} public void setBrand(String v){brand=v;} public void setModel(String v){model=v;}
    public void setPrice(BigDecimal v){price=v;} public void setYear(Integer v){year=v;} public void setFuelType(String v){fuelType=v;}
    public void setTransmission(String v){transmission=v;} public void setBodyType(String v){bodyType=v;} public void setMileage(Double v){mileage=v;}
    public void setDescription(String v){description=v;} public void setImageUrl(String v){imageUrl=v;} public void setMarketCountry(String v){marketCountry=v;} public void setCurrency(String v){currency=v;} public void setMarketPrice(BigDecimal v){marketPrice=v;} public void setAvailable(Boolean v){available=v;}
}
