package com.example.carecommerce.service;

import com.example.carecommerce.model.Report;
import com.example.carecommerce.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReportService {
    private final ReportRepository repo; private final UserRepository users; private final CarRepository cars; private final ShowroomRepository showrooms;
    public ReportService(ReportRepository repo,UserRepository users,CarRepository cars,ShowroomRepository showrooms){this.repo=repo;this.users=users;this.cars=cars;this.showrooms=showrooms;}
    public List<Report> all(){return repo.findAllByOrderByCreatedAtDesc();}
    public List<Report> mine(String email){Long uid=users.findByEmailIgnoreCase(email).orElseThrow().getId();return repo.findByUserIdOrderByCreatedAtDesc(uid);}
    public Report create(String email,Report r){Long uid=users.findByEmailIgnoreCase(email).orElseThrow().getId();if(r.getCarId()!=null)cars.findById(r.getCarId()).orElseThrow(()->new IllegalArgumentException("Car not found."));if(r.getShowroomId()!=null)showrooms.findById(r.getShowroomId()).orElseThrow(()->new IllegalArgumentException("Showroom not found."));r.setId(null);r.setUserId(uid);r.setStatus("OPEN");return repo.save(r);}
    public Report update(Long id,String status,String response){Report r=repo.findById(id).orElseThrow(()->new IllegalArgumentException("Report not found."));if(status!=null&&!status.isBlank())r.setStatus(status.toUpperCase());r.setAdminResponse(response);return repo.save(r);}
}
