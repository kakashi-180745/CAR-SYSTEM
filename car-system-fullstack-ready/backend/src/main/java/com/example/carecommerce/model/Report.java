package com.example.carecommerce.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="reports")
public class Report {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="user_id", nullable=false) private Long userId;
    @Column(name="car_id") private Long carId;
    @Column(name="showroom_id") private Long showroomId;
    @Column(name="issue_type", nullable=false, length=60) private String issueType;
    @Column(nullable=false, length=180) private String subject;
    @Column(nullable=false, length=3000) private String description;
    @Column(name="image_url", length=1000) private String imageUrl;
    @Column(nullable=false, length=30) private String status="OPEN";
    @Column(name="admin_response", length=3000) private String adminResponse;
    @Column(nullable=false) private LocalDateTime createdAt;
    @PrePersist public void prePersist(){if(createdAt==null)createdAt=LocalDateTime.now();if(status==null)status="OPEN";}
    public Report(){}
    public Long getId(){return id;} public Long getUserId(){return userId;} public Long getCarId(){return carId;} public Long getShowroomId(){return showroomId;} public String getIssueType(){return issueType;} public String getSubject(){return subject;} public String getDescription(){return description;} public String getImageUrl(){return imageUrl;} public String getStatus(){return status;} public String getAdminResponse(){return adminResponse;} public LocalDateTime getCreatedAt(){return createdAt;}
    public void setId(Long v){id=v;} public void setUserId(Long v){userId=v;} public void setCarId(Long v){carId=v;} public void setShowroomId(Long v){showroomId=v;} public void setIssueType(String v){issueType=v;} public void setSubject(String v){subject=v;} public void setDescription(String v){description=v;} public void setImageUrl(String v){imageUrl=v;} public void setStatus(String v){status=v;} public void setAdminResponse(String v){adminResponse=v;}
}
