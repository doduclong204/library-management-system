package com.campuslink.library.dto.response.book;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookResponse {

    Integer id;
    String isbn;
    String title;
    String imageUrl;
    String genre;

    @JsonProperty("publication_year")
    Integer publicationYear;

    @JsonProperty("total_copies")
    Integer totalCopies;

    @JsonProperty("available_copies")
    Integer availableCopies;

    List<String> authors;
}