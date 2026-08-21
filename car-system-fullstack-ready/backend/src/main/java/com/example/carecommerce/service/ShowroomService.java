package com.example.carecommerce.service;

import com.example.carecommerce.model.Showroom;
import com.example.carecommerce.repository.ShowroomRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ShowroomService {
    private final ShowroomRepository repo;
    public ShowroomService(ShowroomRepository repo){this.repo=repo;}
    public List<Showroom> getAllShowrooms(){return repo.findAll();}
    public Showroom getShowroomById(Long id){return repo.findById(id).orElseThrow(()->new IllegalArgumentException("Showroom not found."));}
    public Showroom addShowroom(Showroom s){return repo.save(s);}
    public Showroom updateShowroom(Long id,Showroom in){
        Showroom s=getShowroomById(id); s.setName(in.getName());s.setAddress(in.getAddress());s.setCity(in.getCity());
        s.setCountry(in.getCountry());s.setLatitude(in.getLatitude());s.setLongitude(in.getLongitude());s.setPhone(in.getPhone());s.setEmail(in.getEmail());s.setBrand(in.getBrand());s.setState(in.getState());s.setWebsite(in.getWebsite());s.setImageUrl(in.getImageUrl());
        return repo.save(s);
    }
    public void deleteShowroom(Long id){repo.deleteById(id);}
}
