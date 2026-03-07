package com.campuslink.library.controller;

import com.campuslink.library.dto.request.auth.LoginRequest;
import com.campuslink.library.dto.response.api.ApiResponse;
import com.campuslink.library.dto.response.auth.AuthenticationResponse;
import com.campuslink.library.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(@Valid @RequestBody LoginRequest request) {
        ResponseEntity<AuthenticationResponse> response = authService.login(request);
        return ResponseEntity.ok()
                .headers(response.getHeaders())
                .body(ApiResponse.<AuthenticationResponse>builder()
                        .data(response.getBody())
                        .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refresh(HttpServletRequest request) {
        ResponseEntity<AuthenticationResponse> response = authService.refreshToken(request);
        return ResponseEntity.ok()
                .headers(response.getHeaders())
                .body(ApiResponse.<AuthenticationResponse>builder()
                        .data(response.getBody())
                        .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return authService.logout();
    }
}