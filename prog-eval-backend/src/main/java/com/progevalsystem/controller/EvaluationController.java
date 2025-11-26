package com.progevalsystem.controller;

import com.progevalsystem.dto.EvaluationDTO;
import com.progevalsystem.dto.EvaluationResponseDTO;
import com.progevalsystem.entity.Evaluation;
import com.progevalsystem.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @GetMapping
    public List<EvaluationResponseDTO> getAllEvaluations() {
        return evaluationService.getAllEvaluationsAsDTO();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationResponseDTO> getEvaluationById(@PathVariable Long id) {
        return evaluationService.getEvaluationById(id)
                .map(eval -> {
                    EvaluationResponseDTO dto = new EvaluationResponseDTO();
                    dto.setId(eval.getId());
                    if (eval.getSection() != null) dto.setSectionId(eval.getSection().getId());
                    if (eval.getObjective() != null) {
                        dto.setObjectiveId(eval.getObjective().getId());
                        dto.setObjectiveCode(eval.getObjective().getCode());
                        dto.setObjectiveTitle(eval.getObjective().getTitle());
                    }
                    if (eval.getDegree() != null) dto.setDegreeId(eval.getDegree().getId());
                    dto.setAssessmentMethod(eval.getAssessmentMethod());
                    dto.setCountA(eval.getCountA());
                    dto.setCountB(eval.getCountB());
                    dto.setCountC(eval.getCountC());
                    dto.setCountF(eval.getCountF());
                    dto.setComments(eval.getComments());
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public EvaluationResponseDTO createEvaluation(@RequestBody EvaluationDTO evaluationDTO) {
        Evaluation evaluation = evaluationService.createEvaluationFromDTO(evaluationDTO);
        EvaluationResponseDTO dto = new EvaluationResponseDTO();
        dto.setId(evaluation.getId());
        if (evaluation.getSection() != null) dto.setSectionId(evaluation.getSection().getId());
        if (evaluation.getObjective() != null) {
            dto.setObjectiveId(evaluation.getObjective().getId());
            dto.setObjectiveCode(evaluation.getObjective().getCode());
            dto.setObjectiveTitle(evaluation.getObjective().getTitle());
        }
        if (evaluation.getDegree() != null) dto.setDegreeId(evaluation.getDegree().getId());
        dto.setAssessmentMethod(evaluation.getAssessmentMethod());
        dto.setCountA(evaluation.getCountA());
        dto.setCountB(evaluation.getCountB());
        dto.setCountC(evaluation.getCountC());
        dto.setCountF(evaluation.getCountF());
        dto.setComments(evaluation.getComments());
        return dto;
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluationResponseDTO> updateEvaluation(
            @PathVariable Long id,
            @RequestBody EvaluationDTO evaluationDTO) {
        try {
            Evaluation updatedEvaluation = evaluationService.updateEvaluationFromDTO(id, evaluationDTO);
            EvaluationResponseDTO dto = new EvaluationResponseDTO();
            dto.setId(updatedEvaluation.getId());
            if (updatedEvaluation.getSection() != null) dto.setSectionId(updatedEvaluation.getSection().getId());
            if (updatedEvaluation.getObjective() != null) {
                dto.setObjectiveId(updatedEvaluation.getObjective().getId());
                dto.setObjectiveCode(updatedEvaluation.getObjective().getCode());
                dto.setObjectiveTitle(updatedEvaluation.getObjective().getTitle());
            }
            if (updatedEvaluation.getDegree() != null) dto.setDegreeId(updatedEvaluation.getDegree().getId());
            dto.setAssessmentMethod(updatedEvaluation.getAssessmentMethod());
            dto.setCountA(updatedEvaluation.getCountA());
            dto.setCountB(updatedEvaluation.getCountB());
            dto.setCountC(updatedEvaluation.getCountC());
            dto.setCountF(updatedEvaluation.getCountF());
            dto.setComments(updatedEvaluation.getComments());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvaluation(@PathVariable Long id) {
        evaluationService.deleteEvaluation(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search/section/{sectionId}")
    public List<EvaluationResponseDTO> getEvaluationsBySection(@PathVariable Long sectionId) {
        return evaluationService.getEvaluationsBySection(sectionId).stream()
                .map(eval -> {
                    EvaluationResponseDTO dto = new EvaluationResponseDTO();
                    dto.setId(eval.getId());
                    if (eval.getSection() != null) dto.setSectionId(eval.getSection().getId());
                    if (eval.getObjective() != null) {
                        dto.setObjectiveId(eval.getObjective().getId());
                        dto.setObjectiveCode(eval.getObjective().getCode());
                        dto.setObjectiveTitle(eval.getObjective().getTitle());
                    }
                    if (eval.getDegree() != null) dto.setDegreeId(eval.getDegree().getId());
                    dto.setAssessmentMethod(eval.getAssessmentMethod());
                    dto.setCountA(eval.getCountA());
                    dto.setCountB(eval.getCountB());
                    dto.setCountC(eval.getCountC());
                    dto.setCountF(eval.getCountF());
                    dto.setComments(eval.getComments());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/search/degree/{degreeId}")
    public List<EvaluationResponseDTO> getEvaluationsByDegree(@PathVariable Long degreeId) {
        return evaluationService.getEvaluationsByDegree(degreeId).stream()
                .map(eval -> {
                    EvaluationResponseDTO dto = new EvaluationResponseDTO();
                    dto.setId(eval.getId());
                    if (eval.getSection() != null) dto.setSectionId(eval.getSection().getId());
                    if (eval.getObjective() != null) {
                        dto.setObjectiveId(eval.getObjective().getId());
                        dto.setObjectiveCode(eval.getObjective().getCode());
                        dto.setObjectiveTitle(eval.getObjective().getTitle());
                    }
                    if (eval.getDegree() != null) dto.setDegreeId(eval.getDegree().getId());
                    dto.setAssessmentMethod(eval.getAssessmentMethod());
                    dto.setCountA(eval.getCountA());
                    dto.setCountB(eval.getCountB());
                    dto.setCountC(eval.getCountC());
                    dto.setCountF(eval.getCountF());
                    dto.setComments(eval.getComments());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/search/section/{sectionId}/degree/{degreeId}")
    public List<EvaluationResponseDTO> getEvaluationsBySectionAndDegree(
            @PathVariable Long sectionId,
            @PathVariable Long degreeId) {
        return evaluationService.getEvaluationsBySectionAndDegree(sectionId, degreeId).stream()
                .map(eval -> {
                    EvaluationResponseDTO dto = new EvaluationResponseDTO();
                    dto.setId(eval.getId());
                    if (eval.getSection() != null) dto.setSectionId(eval.getSection().getId());
                    if (eval.getObjective() != null) {
                        dto.setObjectiveId(eval.getObjective().getId());
                        dto.setObjectiveCode(eval.getObjective().getCode());
                        dto.setObjectiveTitle(eval.getObjective().getTitle());
                    }
                    if (eval.getDegree() != null) dto.setDegreeId(eval.getDegree().getId());
                    dto.setAssessmentMethod(eval.getAssessmentMethod());
                    dto.setCountA(eval.getCountA());
                    dto.setCountB(eval.getCountB());
                    dto.setCountC(eval.getCountC());
                    dto.setCountF(eval.getCountF());
                    dto.setComments(eval.getComments());
                    return dto;
                })
                .collect(Collectors.toList());
    }

}
