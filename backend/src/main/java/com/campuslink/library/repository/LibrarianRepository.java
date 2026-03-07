package com.campuslink.library.repository;

import com.campuslink.library.entity.Librarian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LibrarianRepository extends JpaRepository<Librarian, Integer> {

    Optional<Librarian> findByEmail(String email);

    Optional<Librarian> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}