package com.example.carecommerce.model;

import jakarta.persistence.*;

@Entity
@Table(name="car_images")
public class CarImage {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="car_id", nullable=false) private Long carId;
    @Column(nullable=false, length=1000) private String imageUrl;
    public CarImage(){}
    public Long getId(){return id;} public Long getCarId(){return carId;} public String getImageUrl(){return imageUrl;}
    public void setId(Long v){id=v;} public void setCarId(Long v){carId=v;} public void setImageUrl(String v){imageUrl=v;}
}
