package com.progevalsystem.service;

import com.progevalsystem.entity.LearningObjective;
import com.progevalsystem.repository.LearningObjectiveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class LearningObjectiveService {

    @Autowired
    private LearningObjectiveRepository learningObjectiveRepository;

    public List<LearningObjective> getAllObjectives() {
        return learningObjectiveRepository.findAll();
    }

    public Optional<LearningObjective> getObjectiveById(Long id) {
        return learningObjectiveRepository.findById(id);
    }

    public LearningObjective createObjective(LearningObjective objective) {
        return learningObjectiveRepository.save(objective);
    }

    public LearningObjective updateObjective(Long id, LearningObjective objectiveDetails) {
        return learningObjectiveRepository.findById(id).map(objective -> {
            objective.setCode(objectiveDetails.getCode());
            objective.setTitle(objectiveDetails.getTitle());
            objective.setDescription(objectiveDetails.getDescription());
            return learningObjectiveRepository.save(objective);
        }).orElseThrow(() -> new RuntimeException("Learning Objective not found"));
    }

    public void deleteObjective(Long id) {
        learningObjectiveRepository.deleteById(id);
    }

    public Optional<LearningObjective> getObjectiveByCode(String code) {
        return learningObjectiveRepository.findByCode(code);
    }

}

