package com.example.carecommerce.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="enquiries")
public class Enquiry {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="user_id") private Long userId;
    @Column(name="car_id", nullable=false) private Long carId;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private String email;
    private String phone;
    @Column(length=2000) private String message;
    @Column(nullable=false, length=30) private String status="NEW";
    @Column(nullable=false) private LocalDateTime createdAt;
    @PrePersist public void prePersist(){if(createdAt==null) createdAt=LocalDateTime.now(); if(status==null) status="NEW";}
    public Enquiry(){}
    public Long getId(){return id;} public Long getUserId(){return userId;} public Long getCarId(){return carId;} public String getName(){return name;}
    public String getEmail(){return email;} public String getPhone(){return phone;} public String getMessage(){return message;} public String getStatus(){return status;} public LocalDateTime getCreatedAt(){return createdAt;}
    public void setId(Long v){id=v;} public void setUserId(Long v){userId=v;} public void setCarId(Long v){carId=v;} public void setName(String v){name=v;}
    public void setEmail(String v){email=v;} public void setPhone(String v){phone=v;} public void setMessage(String v){message=v;} public void setStatus(String v){status=v;}
}
