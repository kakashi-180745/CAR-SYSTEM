package com.example.carecommerce.model;

import jakarta.persistence.*;

@Entity
@Table(name="cart_items", uniqueConstraints=@UniqueConstraint(columnNames={"user_id","car_id"}))
public class CartItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="user_id", nullable=false) private Long userId;
    @Column(name="car_id", nullable=false) private Long carId;
    @Column(nullable=false) private Integer quantity=1;
    public CartItem(){}
    public Long getId(){return id;} public Long getUserId(){return userId;} public Long getCarId(){return carId;} public Integer getQuantity(){return quantity;}
    public void setId(Long v){id=v;} public void setUserId(Long v){userId=v;} public void setCarId(Long v){carId=v;} public void setQuantity(Integer v){quantity=v;}
}
