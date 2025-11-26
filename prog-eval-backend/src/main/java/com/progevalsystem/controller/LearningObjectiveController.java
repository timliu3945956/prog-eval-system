package com.progevalsystem.controller;

import com.progevalsystem.entity.LearningObjective;
import com.progevalsystem.service.LearningObjectiveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/objectives")
public class LearningObjectiveController {

    @Autowired
    private LearningObjectiveService learningObjectiveService;

    @GetMapping
    public List<LearningObjective> getAllObjectives() {
        return learningObjectiveService.getAllObjectives();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningObjective> getObjectiveById(@PathVariable Long id) {
        return learningObjectiveService.getObjectiveById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LearningObjective createObjective(@RequestBody LearningObjective objective) {
        return learningObjectiveService.createObjective(objective);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningObjective> updateObjective(
            @PathVariable Long id,
            @RequestBody LearningObjective objectiveDetails) {
        try {
            LearningObjective updatedObjective = learningObjectiveService.updateObjective(id, objectiveDetails);
            return ResponseEntity.ok(updatedObjective);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObjective(@PathVariable Long id) {
        learningObjectiveService.deleteObjective(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search/code")
    public ResponseEntity<LearningObjective> getObjectiveByCode(@RequestParam String code) {
        return learningObjectiveService.getObjectiveByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
