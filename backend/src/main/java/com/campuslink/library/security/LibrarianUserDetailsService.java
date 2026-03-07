package com.campuslink.library.security;

import com.campuslink.library.entity.Librarian;
import com.campuslink.library.repository.LibrarianRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class LibrarianUserDetailsService implements UserDetailsService {

    private final LibrarianRepository librarianRepository;

    public LibrarianUserDetailsService(LibrarianRepository librarianRepository) {
        this.librarianRepository = librarianRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Librarian librarian = librarianRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy thủ thư với email: " + email));

        return new LibrarianDetails(librarian);
    }
}