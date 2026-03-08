package com.campuslink.library.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatronResponse {

    private Integer id;
    private String email;
    private String fullName;
    private String studentId;

}