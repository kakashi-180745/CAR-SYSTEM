package com.example.carecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 100) private String name;
    @Column(nullable = false, unique = true, length = 160) private String email;
    @JsonIgnore @Column(nullable = false) private String password;
    @Column(nullable = false, length = 20) private String role = "USER";
    @Column(length = 20) private String phone;
    @Column(name = "profile_image", length = 1000) private String profileImage;
    @Column(nullable = false) private LocalDateTime createdAt;

    @PrePersist public void prePersist(){ if(createdAt==null) createdAt=LocalDateTime.now(); }
    public User(){}
    public User(String name,String email,String password,String role){this.name=name;this.email=email;this.password=password;this.role=role;}
    public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} public String getPassword(){return password;} public String getRole(){return role;} public String getPhone(){return phone;} public String getProfileImage(){return profileImage;} public LocalDateTime getCreatedAt(){return createdAt;}
    public void setId(Long v){id=v;} public void setName(String v){name=v;} public void setEmail(String v){email=v;} public void setPassword(String v){password=v;} public void setRole(String v){role=v;} public void setPhone(String v){phone=v;} public void setProfileImage(String v){profileImage=v;}
}
