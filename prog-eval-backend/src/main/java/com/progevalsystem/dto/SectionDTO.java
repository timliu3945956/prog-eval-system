package com.progevalsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectionDTO {
    private Long id;
    private Long courseId;
    private Long instructorId;
    private String semester;
    private String sectionNumber;
    private Integer enrollment;
}
