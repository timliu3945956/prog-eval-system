package com.progevalsystem.controller;

import com.progevalsystem.dto.DegreeCourseMappingDTO;
import com.progevalsystem.entity.DegreeCourseMappings;
import com.progevalsystem.service.DegreeCourseMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/degree-course-mappings")
public class DegreeCourseMappingController {

    @Autowired
    private DegreeCourseMappingService service;

    @GetMapping
    public List<DegreeCourseMappingDTO> getAllMappings() {
        return service.getAllMappingsAsDTO();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DegreeCourseMappings> getMappingById(@PathVariable Long id) {
        return service.getMappingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DegreeCourseMappings createMapping(@RequestBody DegreeCourseMappingDTO dto) {
        return service.createMappingFromDTO(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DegreeCourseMappings> updateMapping(@PathVariable Long id, @RequestBody DegreeCourseMappingDTO dto) {
        try {
            DegreeCourseMappings updated = service.updateMappingFromDTO(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMapping(@PathVariable Long id) {
        service.deleteMapping(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search/degree")
    public List<DegreeCourseMappings> getMappingsByDegree(@RequestParam Long degreeId) {
        return service.getMappingsByDegree(degreeId);
    }

    @GetMapping("/search/course")
    public List<DegreeCourseMappings> getMappingsByCourse(@RequestParam Long courseId) {
        return service.getMappingsByCourse(courseId);
    }
}
