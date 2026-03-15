package com.campuslink.library.repository;

import com.campuslink.library.entity.Patron;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatronRepository extends JpaRepository<Patron, Integer> {

    Optional<Patron> findByEmail(String email);


}