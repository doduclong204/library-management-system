package com.campuslink.library.dto.response.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class LibrarianResponse {

    @JsonProperty("_id")
    Integer id;

    String username;

    String email;

    @JsonProperty("full_name")
    String fullName;

    @JsonProperty("account_locked")
    boolean accountLocked;
}