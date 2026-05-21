package com.campuslink.library.mapper;

import com.campuslink.library.dto.response.DigitalBookResponse;
import com.campuslink.library.entity.DigitalBook;
import com.campuslink.library.entity.DigitalBookPage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DigitalBookMapper {

    @Mapping(target = "pages", source = "pages")
    DigitalBookResponse toResponse(DigitalBook digitalBook);

    @Mapping(target = "pageNumber", source = "pageNumber")
    @Mapping(target = "extractedText", source = "extractedText")
    @Mapping(target = "imagePath", source = "imagePath")
    @Mapping(target = "accuracyPercent", source = "accuracyPercent")
    DigitalBookResponse.PageDto toPageDto(DigitalBookPage page);
}