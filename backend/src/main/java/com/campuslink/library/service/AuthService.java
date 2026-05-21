package com.campuslink.library.service;

import com.campuslink.library.config.SecurityUtil;
import com.campuslink.library.dto.request.auth.LoginRequest;
import com.campuslink.library.dto.response.auth.AuthenticationResponse;
import com.campuslink.library.dto.response.auth.LibrarianResponse;
import com.campuslink.library.entity.Librarian;
import com.campuslink.library.exception.AppException;
import com.campuslink.library.exception.ErrorCode;
import com.campuslink.library.mapper.LibrarianMapper;
import com.campuslink.library.repository.LibrarianRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthService {

    AuthenticationManager authenticationManager;
    LibrarianRepository librarianRepository;
    SecurityUtil securityUtil;
    LibrarianMapper librarianMapper;

    public ResponseEntity<AuthenticationResponse> login(LoginRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank() ||
            request.getPassword() == null || request.getPassword().isBlank()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Librarian librarian = librarianRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.LIBRARIAN_NOT_FOUND));

            if (librarian.isAccountLocked()) {
                throw new AppException(ErrorCode.ACCOUNT_LOCKED);
            }

            LibrarianResponse userResponse = librarianMapper.toLibrarianResponse(librarian);

            String accessToken = securityUtil.generateAccessToken(request.getEmail(), userResponse);
            String refreshToken = securityUtil.generateRefreshToken(request.getEmail());

            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(Duration.ofMillis(604800000L))
                    .sameSite("Strict")
                    .build();

            AuthenticationResponse response = AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(userResponse)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(response);

        } catch (LockedException e) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        } catch (BadCredentialsException e) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        } catch (Exception e) {
            log.error("Lỗi đăng nhập", e);
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    public ResponseEntity<AuthenticationResponse> refreshToken(HttpServletRequest request) {
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AppException(ErrorCode.COOKIES_EMPTY);
        }

        try {
            String email = securityUtil.extractEmail(refreshToken);
            if (securityUtil.isTokenExpired(refreshToken)) {
                throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
            }

            Librarian librarian = librarianRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.LIBRARIAN_NOT_FOUND));

            if (librarian.isAccountLocked()) {
                throw new AppException(ErrorCode.ACCOUNT_LOCKED);
            }

            LibrarianResponse userResponse = librarianMapper.toLibrarianResponse(librarian);

            String newAccessToken = securityUtil.generateAccessToken(email, userResponse);
            String newRefreshToken = securityUtil.generateRefreshToken(email);

            ResponseCookie newCookie = ResponseCookie.from("refresh_token", newRefreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(Duration.ofMillis(604800000L))
                    .sameSite("Strict")
                    .build();

            AuthenticationResponse response = AuthenticationResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .user(userResponse)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, newCookie.toString())
                    .body(response);

        } catch (Exception e) {
            ResponseCookie deleteCookie = ResponseCookie.from("refresh_token", null)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(0)
                    .build();

            log.error("Lỗi refresh token", e);
            return ResponseEntity.status(401)
                    .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                    .body(null);
        }
    }

    public ResponseEntity<Void> logout() {
        ResponseCookie deleteCookie = ResponseCookie.from("refresh_token", null)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }
}