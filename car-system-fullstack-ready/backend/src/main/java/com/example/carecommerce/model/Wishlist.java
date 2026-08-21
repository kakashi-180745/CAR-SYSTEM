package com.example.carecommerce.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="wishlist", uniqueConstraints=@UniqueConstraint(columnNames={"user_id","car_id"}))
public class Wishlist {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="user_id", nullable=false) private Long userId;
    @Column(name="car_id", nullable=false) private Long carId;
    @Column(nullable=false) private LocalDateTime createdAt;
    @PrePersist public void prePersist(){if(createdAt==null) createdAt=LocalDateTime.now();}
    public Wishlist(){}
    public Long getId(){return id;} public Long getUserId(){return userId;} public Long getCarId(){return carId;} public LocalDateTime getCreatedAt(){return createdAt;}
    public void setId(Long v){id=v;} public void setUserId(Long v){userId=v;} public void setCarId(Long v){carId=v;}
}
