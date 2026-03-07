package com.campuslink.library.config;

import com.campuslink.library.entity.Librarian;
import com.campuslink.library.repository.LibrarianRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final LibrarianRepository librarianRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        // Chỉ seed nếu chưa có tài khoản nào
        if (librarianRepository.count() == 0) {
            Librarian testLibrarian = Librarian.builder()
                    .username("thuthu")
                    .email("thuthu@library.com")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .fullName("Thủ Thư Test")
                    .accountLocked(false)
                    .build();

            librarianRepository.save(testLibrarian);

            System.out.println("=====================================");
            System.out.println("ĐÃ TẠO TÀI KHOẢN TEST THỦ THƯ");
            System.out.println("Email: thuthu@library.com");
            System.out.println("Mật khẩu: 123456");
            System.out.println("=====================================");
        }
    }
}