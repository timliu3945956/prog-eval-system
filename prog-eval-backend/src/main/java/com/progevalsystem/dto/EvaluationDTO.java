package com.progevalsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationDTO {
    private Long id;
    private Long sectionId;
    private Long objectiveId;
    private Long degreeId;
    private String assessmentMethod; // "Homework", "Project", "Quiz", etc.
    private Integer countA = 0;
    private Integer countB = 0;
    private Integer countC = 0;
    private Integer countF = 0;
    private String comments;
}
