package com.progevalsystem.service;

import com.progevalsystem.dto.EvaluationDTO;
import com.progevalsystem.dto.EvaluationResponseDTO;
import com.progevalsystem.entity.Degree;
import com.progevalsystem.entity.Evaluation;
import com.progevalsystem.entity.LearningObjective;
import com.progevalsystem.entity.Section;
import com.progevalsystem.repository.DegreeRepository;
import com.progevalsystem.repository.EvaluationRepository;
import com.progevalsystem.repository.LearningObjectiveRepository;
import com.progevalsystem.repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EvaluationService {

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private LearningObjectiveRepository objectiveRepository;

    @Autowired
    private DegreeRepository degreeRepository;

    public List<EvaluationResponseDTO> getAllEvaluationsAsDTO() {
        return evaluationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private EvaluationResponseDTO convertToDTO(Evaluation evaluation) {
        EvaluationResponseDTO dto = new EvaluationResponseDTO();
        dto.setId(evaluation.getId());
        if (evaluation.getSection() != null) {
            dto.setSectionId(evaluation.getSection().getId());
        }
        if (evaluation.getObjective() != null) {
            dto.setObjectiveId(evaluation.getObjective().getId());
            dto.setObjectiveCode(evaluation.getObjective().getCode());
            dto.setObjectiveTitle(evaluation.getObjective().getTitle());
        }
        if (evaluation.getDegree() != null) {
            dto.setDegreeId(evaluation.getDegree().getId());
        }
        dto.setAssessmentMethod(evaluation.getAssessmentMethod());
        dto.setCountA(evaluation.getCountA());
        dto.setCountB(evaluation.getCountB());
        dto.setCountC(evaluation.getCountC());
        dto.setCountF(evaluation.getCountF());
        dto.setComments(evaluation.getComments());
        if (evaluation.getCreatedAt() != null) {
            dto.setCreatedAt(evaluation.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));
        }
        return dto;
    }

    public List<Evaluation> getAllEvaluations() {
        return evaluationRepository.findAll();
    }

    public Optional<Evaluation> getEvaluationById(Long id) {
        return evaluationRepository.findById(id);
    }

    public Evaluation createEvaluation(Evaluation evaluation) {
        return evaluationRepository.save(evaluation);
    }

    public Evaluation createEvaluationFromDTO(EvaluationDTO dto) {
        Evaluation evaluation = new Evaluation();
        
        if (dto.getSectionId() != null) {
            Section section = sectionRepository.findById(dto.getSectionId())
                    .orElseThrow(() -> new RuntimeException("Section not found with id: " + dto.getSectionId()));
            evaluation.setSection(section);
        }
        
        if (dto.getObjectiveId() != null) {
            LearningObjective objective = objectiveRepository.findById(dto.getObjectiveId())
                    .orElseThrow(() -> new RuntimeException("Objective not found with id: " + dto.getObjectiveId()));
            evaluation.setObjective(objective);
        }
        
        if (dto.getDegreeId() != null) {
            Degree degree = degreeRepository.findById(dto.getDegreeId())
                    .orElseThrow(() -> new RuntimeException("Degree not found with id: " + dto.getDegreeId()));
            evaluation.setDegree(degree);
        }
        
        evaluation.setAssessmentMethod(dto.getAssessmentMethod());
        evaluation.setCountA(dto.getCountA() != null ? dto.getCountA() : 0);
        evaluation.setCountB(dto.getCountB() != null ? dto.getCountB() : 0);
        evaluation.setCountC(dto.getCountC() != null ? dto.getCountC() : 0);
        evaluation.setCountF(dto.getCountF() != null ? dto.getCountF() : 0);
        evaluation.setComments(dto.getComments());
        
        return evaluationRepository.save(evaluation);
    }

    public Evaluation updateEvaluation(Long id, Evaluation evaluationDetails) {
        return evaluationRepository.findById(id).map(evaluation -> {
            if (evaluationDetails.getAssessmentMethod() != null) {
                evaluation.setAssessmentMethod(evaluationDetails.getAssessmentMethod());
            }
            if (evaluationDetails.getCountA() != null) {
                evaluation.setCountA(evaluationDetails.getCountA());
            }
            if (evaluationDetails.getCountB() != null) {
                evaluation.setCountB(evaluationDetails.getCountB());
            }
            if (evaluationDetails.getCountC() != null) {
                evaluation.setCountC(evaluationDetails.getCountC());
            }
            if (evaluationDetails.getCountF() != null) {
                evaluation.setCountF(evaluationDetails.getCountF());
            }
            if (evaluationDetails.getComments() != null) {
                evaluation.setComments(evaluationDetails.getComments());
            }
            return evaluationRepository.save(evaluation);
        }).orElseThrow(() -> new RuntimeException("Evaluation not found"));
    }

    public Evaluation updateEvaluationFromDTO(Long id, EvaluationDTO dto) {
        return evaluationRepository.findById(id).map(evaluation -> {
            if (dto.getSectionId() != null) {
                Section section = sectionRepository.findById(dto.getSectionId())
                        .orElseThrow(() -> new RuntimeException("Section not found"));
                evaluation.setSection(section);
            }
            
            if (dto.getObjectiveId() != null) {
                LearningObjective objective = objectiveRepository.findById(dto.getObjectiveId())
                        .orElseThrow(() -> new RuntimeException("Objective not found"));
                evaluation.setObjective(objective);
            }
            
            if (dto.getDegreeId() != null) {
                Degree degree = degreeRepository.findById(dto.getDegreeId())
                        .orElseThrow(() -> new RuntimeException("Degree not found"));
                evaluation.setDegree(degree);
            }
            
            if (dto.getAssessmentMethod() != null) {
                evaluation.setAssessmentMethod(dto.getAssessmentMethod());
            }
            if (dto.getCountA() != null) {
                evaluation.setCountA(dto.getCountA());
            }
            if (dto.getCountB() != null) {
                evaluation.setCountB(dto.getCountB());
            }
            if (dto.getCountC() != null) {
                evaluation.setCountC(dto.getCountC());
            }
            if (dto.getCountF() != null) {
                evaluation.setCountF(dto.getCountF());
            }
            if (dto.getComments() != null) {
                evaluation.setComments(dto.getComments());
            }
            
            return evaluationRepository.save(evaluation);
        }).orElseThrow(() -> new RuntimeException("Evaluation not found"));
    }

    public void deleteEvaluation(Long id) {
        evaluationRepository.deleteById(id);
    }

    public List<Evaluation> getEvaluationsBySection(Long sectionId) {
        return evaluationRepository.findBySectionId(sectionId);
    }

    public List<Evaluation> getEvaluationsByObjective(Long objectiveId) {
        return evaluationRepository.findByObjectiveId(objectiveId);
    }

    public List<Evaluation> getEvaluationsByDegree(Long degreeId) {
        return evaluationRepository.findByDegreeId(degreeId);
    }

    public List<Evaluation> getEvaluationsBySectionAndDegree(Long sectionId, Long degreeId) {
        return evaluationRepository.findBySectionAndDegreeWithEagerLoading(sectionId, degreeId);
    }

}

