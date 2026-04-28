package com.sonsoflilith.backend.service.impl;

import com.sonsoflilith.backend.dto.request.RegisterRequest;
import com.sonsoflilith.backend.dto.response.AuthResponse;
import com.sonsoflilith.backend.entity.Role;
import com.sonsoflilith.backend.entity.User;
import com.sonsoflilith.backend.repository.RoleRepository;
import com.sonsoflilith.backend.repository.UserRepository;
import com.sonsoflilith.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(roles);

        userRepository.save(user);

        return new AuthResponse(null, user.getUsername(), user.getEmail());
    }
}