package com.progevalsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectionResponseDTO {
    private Long id;
    private Long courseId;
    private String courseNumber;
    private String courseTitle;
    private Long instructorId;
    private String instructorName;
    private String semester;
    private String sectionNumber;
    private Integer enrollment;
}
