package com.campuslink.library.repository;

import com.campuslink.library.entity.DigitalBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalBookRepository extends JpaRepository<DigitalBook, Long> {

    @Query("SELECT d FROM DigitalBook d WHERE " +
            "LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(d.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(d.extractedText) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<DigitalBook> searchByKeyword(@Param("keyword") String keyword);

    List<DigitalBook> findAllByOrderByOcrDateDesc();
}
