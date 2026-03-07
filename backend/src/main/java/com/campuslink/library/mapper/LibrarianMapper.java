package com.campuslink.library.mapper;

import com.campuslink.library.dto.response.auth.LibrarianResponse;
import com.campuslink.library.entity.Librarian;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LibrarianMapper {
    @Mapping(target = "id", source = "id")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "fullName", source = "fullName")
    @Mapping(target = "accountLocked", source = "accountLocked")
    LibrarianResponse toLibrarianResponse(Librarian librarian);
}