package com.campuslink.library.repository;

import com.campuslink.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {

    boolean existsByIsbn(String isbn);

    @Query("""
        SELECT DISTINCT b FROM Book b
        LEFT JOIN b.authors a
        WHERE (:keyword IS NULL OR :keyword = ''
               OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(b.fullText) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:genre IS NULL OR :genre = '' OR LOWER(b.genre) = LOWER(:genre))
          AND (:authorName IS NULL OR :authorName = '' OR LOWER(a.name) LIKE LOWER(CONCAT('%', :authorName, '%')))
          AND (:yearFrom IS NULL OR b.publicationYear >= :yearFrom)
          AND (:yearTo IS NULL OR b.publicationYear <= :yearTo)
    """)
    Page<Book> searchBooks(
            @Param("keyword") String keyword,
            @Param("genre") String genre,
            @Param("authorName") String authorName,
            @Param("yearFrom") Integer yearFrom,
            @Param("yearTo") Integer yearTo,
            Pageable pageable
    );
}