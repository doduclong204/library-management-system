package com.campuslink.library.dto.request.book;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookRequest {

    @NotBlank(message = "ISBN không được để trống")
    String isbn;

    @NotBlank(message = "Tiêu đề không được để trống")
    String title;
    String imageUrl;

    String genre;

    @JsonProperty("publication_year")
    Integer publicationYear;

    @JsonProperty("total_copies")
    @Min(value = 1, message = "Số lượng phải >= 1")
    @NotNull(message = "Số lượng không được để trống")
    Integer totalCopies;

    @JsonProperty("author_ids")
    List<Integer> authorIds;

    /** Tên tác giả (cách nhau bởi dấu phẩy). Nếu không tồn tại sẽ tạo mới. Ưu tiên hơn author_ids. */
    @JsonProperty("author_names")
    List<String> authorNames;
}