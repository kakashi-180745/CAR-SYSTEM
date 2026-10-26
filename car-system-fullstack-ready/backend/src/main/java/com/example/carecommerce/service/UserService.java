package com.example.carecommerce.service;

import com.example.carecommerce.model.User;
import com.example.carecommerce.repository.CartItemRepository;
import com.example.carecommerce.repository.UserRepository;
import com.example.carecommerce.repository.WishlistRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService {
    private final UserRepository repo;
    private final CartItemRepository cartRepo;
    private final WishlistRepository wishlistRepo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, CartItemRepository cartRepo, WishlistRepository wishlistRepo, PasswordEncoder encoder) {
        this.repo = repo;
        this.cartRepo = cartRepo;
        this.wishlistRepo = wishlistRepo;
        this.encoder = encoder;
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }

    public User getUserById(Long id) {
        return repo.findById(id).orElseThrow(() -> new NoSuchElementException("User not found."));
    }

    public User updateUser(Long id, User input) {
        User u = getUserById(id);
        applyProfileUpdates(u, input);
        return repo.save(u);
    }

    public User getSelf(String email) {
        return repo.findByEmailIgnoreCase(email).orElseThrow(() -> new NoSuchElementException("User not found."));
    }

    public User save(User user) {
        return repo.save(user);
    }

    public User updateSelf(String email, User input) {
        User u = getSelf(email);
        applyProfileUpdates(u, input);
        return repo.save(u);
    }

    @Transactional
    public void deleteUser(Long id, String requesterEmail) {
        User target = getUserById(id);
        if (target.getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new IllegalArgumentException("You cannot delete your own account.");
        }
        if ("ADMIN".equalsIgnoreCase(target.getRole())) {
            throw new IllegalArgumentException("Administrator accounts cannot be deleted from here.");
        }
        cartRepo.deleteByUserId(id);
        wishlistRepo.deleteByUserId(id);
        repo.deleteById(id);
    }

    private void applyProfileUpdates(User u, User input) {
        if (input.getName() != null) {
            String trimmedName = input.getName().trim();
            if (trimmedName.length() < 2) {
                throw new IllegalArgumentException("Name must be at least 2 characters.");
            }
            u.setName(trimmedName);
        }
        if (input.getPhone() != null) {
            String trimmedPhone = input.getPhone().trim();
            if (!trimmedPhone.isEmpty() && !trimmedPhone.matches("^[0-9+()\\- ]{7,20}$")) {
                throw new IllegalArgumentException("Please enter a valid phone number.");
            }
            u.setPhone(trimmedPhone);
        }
        if (input.getProfileImage() != null) {
            String img = input.getProfileImage().trim();
            if (img.isEmpty()) {
                u.setProfileImage(null);
            } else if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/uploads/")) {
                u.setProfileImage(img);
            } else {
                throw new IllegalArgumentException("Profile image URL must start with https://, http://, or /uploads/.");
            }
        }
        if (input.getPassword() != null && !input.getPassword().isBlank()) {
            if (input.getPassword().length() < 8) {
                throw new IllegalArgumentException("Password must contain at least 8 characters.");
            }
            u.setPassword(encoder.encode(input.getPassword()));
        }
    }
}
