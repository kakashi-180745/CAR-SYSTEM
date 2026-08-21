package com.example.carecommerce.controller;

import com.example.carecommerce.model.Report;
import com.example.carecommerce.service.ReportService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/reports")
public class ReportController {
    private final ReportService service; public ReportController(ReportService service){this.service=service;}
    @GetMapping("/mine") public List<Report> mine(Principal p){return service.mine(p.getName());}
    @GetMapping @PreAuthorize("hasRole('ADMIN')") public List<Report> all(){return service.all();}
    @PostMapping public Report create(@RequestBody Report r,Principal p){return service.create(p.getName(),r);}
    @PatchMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public Report update(@PathVariable Long id,@RequestBody Map<String,String> body){return service.update(id,body.get("status"),body.get("adminResponse"));}
}
