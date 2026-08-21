package com.example.carecommerce.controller;

import com.example.carecommerce.model.Enquiry;
import com.example.carecommerce.service.EnquiryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {
    private final EnquiryService service;
    public EnquiryController(EnquiryService service){this.service=service;}
    @GetMapping("/mine") public List<Enquiry> mine(Principal p){return service.getMine(p.getName());}
    @GetMapping @PreAuthorize("hasRole('ADMIN')") public List<Enquiry> all(){return service.getAll();}
    @PostMapping public Enquiry create(@RequestBody Enquiry e,Principal p){return service.create(p.getName(),e);}
    @PatchMapping("/{id}/status") @PreAuthorize("hasRole('ADMIN')")
    public Enquiry status(@PathVariable Long id,@RequestBody Map<String,String> body){return service.updateStatus(id,body.get("status"));}
}
