package com.example.carecommerce.controller;

import com.example.carecommerce.model.User;
import com.example.carecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.*;
import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final UserService users;
    private final Path uploadDir;

    public ProfileController(UserService users, @Value("${app.upload-dir:uploads/profiles}") String dir) {
        this.users = users;
        this.uploadDir = Paths.get(dir);
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public User upload(@RequestParam("file") MultipartFile file, Principal principal) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose an image.");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Profile image must be 5MB or smaller.");
        }

        BufferedImage decoded;
        try (var input = file.getInputStream()) {
            decoded = ImageIO.read(input);
        }
        if (decoded == null) {
            throw new IllegalArgumentException("The uploaded file is not a valid JPG, PNG, GIF or BMP image.");
        }
        if (decoded.getWidth() > 6000 || decoded.getHeight() > 6000) {
            throw new IllegalArgumentException("Profile image dimensions are too large.");
        }

        // Convert RGBA/palette images onto a clean RGB canvas so JPEG encoding always succeeds
        BufferedImage rgbImage = new BufferedImage(decoded.getWidth(), decoded.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgbImage.createGraphics();
        try {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, decoded.getWidth(), decoded.getHeight());
            g.drawImage(decoded, 0, 0, null);
        } finally {
            g.dispose();
        }

        Path base = uploadDir.toAbsolutePath().normalize();
        Files.createDirectories(base);
        String name = UUID.randomUUID() + ".jpg";
        Path target = base.resolve(name).normalize();
        if (!base.equals(target.getParent())) {
            throw new IllegalArgumentException("Invalid upload path.");
        }
        if (!ImageIO.write(rgbImage, "jpg", target.toFile())) {
            throw new IllegalArgumentException("Could not process the profile image.");
        }

        User u = users.getSelf(principal.getName());
        u.setProfileImage("/uploads/profiles/" + name);
        return users.save(u);
    }
}
