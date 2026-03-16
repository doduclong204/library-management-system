package com.campuslink.library.repository;

import com.campuslink.library.entity.BookCopy;
import com.campuslink.library.enums.BookStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.awt.print.Pageable;
import java.util.Optional;

public interface BookCopyRepository extends JpaRepository<BookCopy, Integer> {

    Optional<BookCopy> findFirstByBookIdAndStatus(Integer bookId, BookStatus status);

    @Query(value = "SELECT * FROM book_copies WHERE book_id = :bookId AND status = 'available' LIMIT 1",
            nativeQuery = true)
    Optional<BookCopy> findFirstAvailableByBookId(@Param("bookId") Integer bookId);
}
