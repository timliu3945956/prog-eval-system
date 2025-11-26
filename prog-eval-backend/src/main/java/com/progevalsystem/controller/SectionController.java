package com.progevalsystem.controller;

import com.progevalsystem.dto.SectionDTO;
import com.progevalsystem.dto.SectionResponseDTO;
import com.progevalsystem.entity.Section;
import com.progevalsystem.service.SectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @GetMapping
    public List<SectionResponseDTO> getAllSections() {
        return sectionService.getAllSectionsAsDTO();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Section> getSectionById(@PathVariable Long id) {
        return sectionService.getSectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Section createSection(@RequestBody SectionDTO sectionDTO) {
        return sectionService.createSectionFromDTO(sectionDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Section> updateSection(@PathVariable Long id, @RequestBody SectionDTO sectionDTO) {
        try {
            Section updatedSection = sectionService.updateSectionFromDTO(id, sectionDTO);
            return ResponseEntity.ok(updatedSection);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        sectionService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search/course")
    public List<Section> getSectionsByCourse(@RequestParam Long courseId) {
        return sectionService.getSectionsByCourse(courseId);
    }

    @GetMapping("/search/instructor")
    public List<Section> getSectionsByInstructor(@RequestParam Long instructorId) {
        return sectionService.getSectionsByInstructor(instructorId);
    }

    @GetMapping("/search/semester")
    public List<Section> getSectionsBySemester(@RequestParam String semester) {
        return sectionService.getSectionsBySemester(semester);
    }

}
