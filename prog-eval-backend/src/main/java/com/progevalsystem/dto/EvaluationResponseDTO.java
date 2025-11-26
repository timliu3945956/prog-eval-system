package com.progevalsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResponseDTO {
    private Long id;
    private Long sectionId;
    private Long objectiveId;
    private Long degreeId;
    private String objectiveCode;
    private String objectiveTitle;
    private String assessmentMethod;
    private Integer countA;
    private Integer countB;
    private Integer countC;
    private Integer countF;
    private String comments;
    private String createdAt;
}
