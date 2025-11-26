package com.progevalsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DegreeCourseMappingDTO {
    private Long id;
    private Long degreeId;
    private Long courseId;
    private Boolean isCore;
}
