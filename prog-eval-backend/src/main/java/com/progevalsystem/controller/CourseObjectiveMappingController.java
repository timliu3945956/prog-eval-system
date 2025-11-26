package com.progevalsystem.controller;

import com.progevalsystem.dto.CourseObjectiveMappingDTO;
import com.progevalsystem.dto.CourseObjectiveMappingResponseDTO;
import com.progevalsystem.entity.CourseObjectiveMapping;
import com.progevalsystem.service.CourseObjectiveMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-objective-mappings")
public class CourseObjectiveMappingController {

    @Autowired
    private CourseObjectiveMappingService courseObjectiveMappingService;

    @GetMapping
    public List<CourseObjectiveMappingResponseDTO> getAllMappings() {
        return courseObjectiveMappingService.getAllMappingsAsDTO();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseObjectiveMapping> getMappingById(@PathVariable Long id) {
        return courseObjectiveMappingService.getMappingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CourseObjectiveMapping createMapping(@RequestBody CourseObjectiveMappingDTO dto) {
        return courseObjectiveMappingService.createMappingFromDTO(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseObjectiveMapping> updateMapping(
            @PathVariable Long id,
            @RequestBody CourseObjectiveMappingDTO dto) {
        try {
            CourseObjectiveMapping updatedMapping = courseObjectiveMappingService.updateMappingFromDTO(id, dto);
            return ResponseEntity.ok(updatedMapping);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMapping(@PathVariable Long id) {
        courseObjectiveMappingService.deleteMapping(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/course/{courseId}")
    public List<CourseObjectiveMapping> getMappingsByCourse(@PathVariable Long courseId) {
        return courseObjectiveMappingService.getMappingsByCourse(courseId);
    }

    @GetMapping("/objective/{objectiveId}")
    public List<CourseObjectiveMapping> getMappingsByObjective(@PathVariable Long objectiveId) {
        return courseObjectiveMappingService.getMappingsByObjective(objectiveId);
    }

}
