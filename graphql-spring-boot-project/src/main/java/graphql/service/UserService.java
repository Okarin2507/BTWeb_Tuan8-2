package graphql.service;

import graphql.entity.User;
import graphql.input.UserInput;
import graphql.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(UserInput userInput) {
        User user = new User();
        user.setFullname(userInput.getFullname());
        user.setEmail(userInput.getEmail());
        user.setPassword(passwordEncoder.encode(userInput.getPassword()));
        user.setPhone(userInput.getPhone());
        user.setRole(userInput.getRole() != null && !userInput.getRole().trim().isEmpty() ? userInput.getRole().toUpperCase() : "USER");
        return userRepository.save(user);
    }
    
    public Optional<User> updateUser(Long id, UserInput userInput) {
        return userRepository.findById(id).map(user -> {
            user.setFullname(userInput.getFullname());
            user.setEmail(userInput.getEmail());
            if (userInput.getPassword() != null && !userInput.getPassword().isEmpty()) {
                 user.setPassword(passwordEncoder.encode(userInput.getPassword()));
            }
            user.setPhone(userInput.getPhone());
            if (userInput.getRole() != null && !userInput.getRole().isEmpty()) {
                user.setRole(userInput.getRole().toUpperCase());
            }
            return userRepository.save(user);
        });
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}