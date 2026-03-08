package com.campuslink.library.service;

import com.campuslink.library.dto.request.PatronRequest;
import com.campuslink.library.dto.response.PatronResponse;

public interface PatronService {

    PatronResponse findByEmail(String email);

    PatronResponse createPatron(PatronRequest request);

}