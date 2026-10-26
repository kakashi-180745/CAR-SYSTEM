package com.example.carecommerce.controller;

import com.example.carecommerce.model.User;
import com.example.carecommerce.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public User me(Principal p) {
        return service.getSelf(p.getName());
    }

    @PutMapping("/me")
    public User updateMe(@RequestBody User u, Principal p) {
        return service.updateSelf(p.getName(), u);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> all() {
        return service.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User one(@PathVariable Long id) {
        return service.getUserById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User update(@PathVariable Long id, @RequestBody User u) {
        return service.updateUser(id, u);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal p) {
        service.deleteUser(id, p.getName());
        return ResponseEntity.noContent().build();
    }
}
