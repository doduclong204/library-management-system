package com.campuslink.library.security;

import com.campuslink.library.entity.Librarian;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class LibrarianDetails implements UserDetails {

    private final Librarian librarian;

    public LibrarianDetails(Librarian librarian) {
        this.librarian = librarian;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_LIBRARIAN"));
    }

    @Override
    public String getPassword() {
        return librarian.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return librarian.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !librarian.isAccountLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Integer getId() {
        return librarian.getId();
    }

    public String getFullName() {
        return librarian.getFullName();
    }

    public String getEmail() {
        return librarian.getEmail();
    }
}