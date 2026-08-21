package com.example.carecommerce.service;

import com.example.carecommerce.model.Enquiry;
import com.example.carecommerce.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EnquiryService {
    private final EnquiryRepository repo;
    private final UserRepository userRepo;
    private final CarRepository carRepo;
    public EnquiryService(EnquiryRepository repo,UserRepository userRepo,CarRepository carRepo){this.repo=repo;this.userRepo=userRepo;this.carRepo=carRepo;}
    public List<Enquiry> getAll(){return repo.findAll();}
    public List<Enquiry> getMine(String email){Long uid=userRepo.findByEmailIgnoreCase(email).orElseThrow().getId();return repo.findByUserId(uid);}
    public Enquiry create(String email,Enquiry e){
        Long uid=userRepo.findByEmailIgnoreCase(email).orElseThrow().getId();
        carRepo.findById(e.getCarId()).orElseThrow(()->new IllegalArgumentException("Car not found."));
        e.setUserId(uid); e.setName(e.getName()==null?userRepo.findById(uid).orElseThrow().getName():e.getName());
        var user=userRepo.findById(uid).orElseThrow();
        e.setEmail(email); e.setPhone(user.getPhone()); e.setStatus("NEW"); return repo.save(e);
    }
    public Enquiry updateStatus(Long id,String status){Enquiry e=repo.findById(id).orElseThrow(()->new IllegalArgumentException("Enquiry not found."));e.setStatus(status);return repo.save(e);}
}
