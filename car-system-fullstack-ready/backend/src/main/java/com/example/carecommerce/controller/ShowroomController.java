package com.example.carecommerce.controller;

import com.example.carecommerce.model.Showroom;
import com.example.carecommerce.service.ShowroomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/showrooms")
public class ShowroomController {
    private final ShowroomService service;
    public ShowroomController(ShowroomService service){this.service=service;}
    @GetMapping public List<Showroom> all(){return service.getAllShowrooms();}
    @GetMapping("/{id}") public Showroom one(@PathVariable Long id){return service.getShowroomById(id);}
    @PostMapping @PreAuthorize("hasRole('ADMIN')") public Showroom add(@RequestBody Showroom s){return service.addShowroom(s);}
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public Showroom update(@PathVariable Long id,@RequestBody Showroom s){return service.updateShowroom(id,s);}
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<Void> delete(@PathVariable Long id){service.deleteShowroom(id);return ResponseEntity.noContent().build();}
}
