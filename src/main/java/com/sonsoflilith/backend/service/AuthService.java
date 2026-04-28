package com.sonsoflilith.backend.service;

import com.sonsoflilith.backend.dto.request.RegisterRequest;
import com.sonsoflilith.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
}