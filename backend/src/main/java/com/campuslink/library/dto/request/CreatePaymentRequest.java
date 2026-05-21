package com.campuslink.library.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreatePaymentRequest {

    private Integer borrowRecordId;
    private String sessionId;
    List<Integer> borrowRecordIds;
}