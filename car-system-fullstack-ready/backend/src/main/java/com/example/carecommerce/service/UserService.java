package com.example.carecommerce.service;

import com.example.carecommerce.model.User;
import com.example.carecommerce.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service public class UserService {
    private final UserRepository repo; private final PasswordEncoder encoder;
    public UserService(UserRepository repo,PasswordEncoder encoder){this.repo=repo;this.encoder=encoder;}
    public List<User> getAllUsers(){return repo.findAll();}
    public User getUserById(Long id){return repo.findById(id).orElseThrow(()->new IllegalArgumentException("User not found."));}
    public User updateUser(Long id,User input){User u=getUserById(id);u.setName(input.getName());u.setPhone(input.getPhone());if(input.getProfileImage()!=null)u.setProfileImage(input.getProfileImage());if(input.getPassword()!=null&&!input.getPassword().isBlank())u.setPassword(encoder.encode(input.getPassword()));return repo.save(u);}
    public User getSelf(String email){return repo.findByEmailIgnoreCase(email).orElseThrow(()->new IllegalArgumentException("User not found."));}
    public User save(User user){return repo.save(user);}
    public User updateSelf(String email,User input){User u=repo.findByEmailIgnoreCase(email).orElseThrow(()->new IllegalArgumentException("User not found."));if(input.getName()!=null&&!input.getName().isBlank())u.setName(input.getName().trim());if(input.getPhone()!=null)u.setPhone(input.getPhone().trim());if(input.getProfileImage()!=null)u.setProfileImage(input.getProfileImage());if(input.getPassword()!=null&&!input.getPassword().isBlank())u.setPassword(encoder.encode(input.getPassword()));return repo.save(u);}
    public void deleteUser(Long id){repo.deleteById(id);}
}
