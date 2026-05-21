package com.campuslink.library.mapper;

import com.campuslink.library.dto.response.PatronResponse;
import com.campuslink.library.entity.Patron;

public class PatronMapper {

    public static PatronResponse toResponse(Patron patron){

        return PatronResponse.builder()
                .id(patron.getId())
                .email(patron.getEmail())
                .fullName(patron.getFullName())
                .studentId(patron.getStudentId())
                .build();

    }

}