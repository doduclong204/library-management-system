package com.campuslink.library.service;


import com.campuslink.library.dto.request.PatronRequest;
import com.campuslink.library.dto.response.PatronResponse;
import com.campuslink.library.entity.Patron;
import com.campuslink.library.mapper.PatronMapper;
import com.campuslink.library.repository.PatronRepository;
import com.campuslink.library.service.PatronService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatronServiceImpl implements PatronService {

    private final PatronRepository patronRepository;

    @Override
    public PatronResponse findByEmail(String email) {

        Patron patron = patronRepository.findByEmail(email)
                .orElse(null);

        if(patron == null){
            return null;
        }

        return PatronMapper.toResponse(patron);
    }

    @Override
    public PatronResponse createPatron(PatronRequest request) {

        Patron patron = Patron.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .studentId(request.getStudentId())
                .build();

        patron = patronRepository.save(patron);

        return PatronMapper.toResponse(patron);
    }
}