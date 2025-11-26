package com.progevalsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseObjectiveMappingResponseDTO {
    private Long id;
    private Long courseId;
    private String courseNumber;
    private String courseTitle;
    private Long objectiveId;
    private String objectiveCode;
    private String objectiveTitle;
}
