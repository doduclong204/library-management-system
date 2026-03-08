package com.campuslink.library.controller;

import com.campuslink.library.dto.request.PatronRequest;
import com.campuslink.library.dto.response.PatronResponse;
import com.campuslink.library.entity.Patron;
import com.campuslink.library.mapper.PatronMapper;
import com.campuslink.library.repository.PatronRepository;
import com.campuslink.library.service.PatronService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patrons")
@RequiredArgsConstructor
public class PatronController {

    private final PatronService patronService;
    private final PatronRepository patronRepository;

    @GetMapping("/search")
    public PatronResponse findByEmail(@RequestParam String email){

        return patronService.findByEmail(email);

    }

    @PostMapping
    public PatronResponse createPatron(@RequestBody Patron patron){

        patron = patronRepository.save(patron);

        return PatronMapper.toResponse(patron);
    }

}