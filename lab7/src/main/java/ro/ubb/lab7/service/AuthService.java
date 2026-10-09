package ro.ubb.lab7.service;

import ro.ubb.lab7.model.User;
import ro.ubb.lab7.repository.UserRepository;
import ro.ubb.lab7.util.PasswordUtil;

import java.util.Optional;

public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> authenticate(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(user -> PasswordUtil.matches(password, user.getPasswordHash()));
    }
}
