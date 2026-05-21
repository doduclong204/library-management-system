package com.campuslink.library.dto.request;

import lombok.Data;

@Data
public class PatronRequest {

    private String email;
    private String fullName;
    private String studentId;

}