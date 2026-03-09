package com.campuslink.library.mapper;

import com.campuslink.library.dto.response.book.BookResponse;
import com.campuslink.library.entity.Author;
import com.campuslink.library.entity.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface BookMapper {

    @Mapping(target = "authors", source = "authors", qualifiedByName = "authorsToNames")
    BookResponse toResponse(Book book);

    @Named("authorsToNames")
    default List<String> authorsToNames(List<Author> authors) {
        if (authors == null || authors.isEmpty()) return Collections.emptyList();
        return authors.stream()
                .map(author -> author.getName())
                .collect(Collectors.toList());
    }
}