package com.progevalsystem.service;

import com.progevalsystem.dto.CourseObjectiveMappingDTO;
import com.progevalsystem.dto.CourseObjectiveMappingResponseDTO;
import com.progevalsystem.entity.Course;
import com.progevalsystem.entity.CourseObjectiveMapping;
import com.progevalsystem.entity.LearningObjective;
import com.progevalsystem.repository.CourseObjectiveMappingRepository;
import com.progevalsystem.repository.CourseRepository;
import com.progevalsystem.repository.LearningObjectiveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseObjectiveMappingService {

    @Autowired
    private CourseObjectiveMappingRepository courseObjectiveMappingRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LearningObjectiveRepository learningObjectiveRepository;

    public List<CourseObjectiveMapping> getAllMappings() {
        return courseObjectiveMappingRepository.findAll();
    }

    public List<CourseObjectiveMappingResponseDTO> getAllMappingsAsDTO() {
        return courseObjectiveMappingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CourseObjectiveMappingResponseDTO convertToDTO(CourseObjectiveMapping mapping) {
        CourseObjectiveMappingResponseDTO dto = new CourseObjectiveMappingResponseDTO();
        dto.setId(mapping.getId());
        
        if (mapping.getCourse() != null) {
            dto.setCourseId(mapping.getCourse().getId());
            dto.setCourseNumber(mapping.getCourse().getCourseNumber());
            dto.setCourseTitle(mapping.getCourse().getTitle());
        }
        
        if (mapping.getObjective() != null) {
            dto.setObjectiveId(mapping.getObjective().getId());
            dto.setObjectiveCode(mapping.getObjective().getCode());
            dto.setObjectiveTitle(mapping.getObjective().getTitle());
        }
        
        return dto;
    }

    public Optional<CourseObjectiveMapping> getMappingById(Long id) {
        return courseObjectiveMappingRepository.findById(id);
    }

    public CourseObjectiveMapping createMapping(CourseObjectiveMapping mapping) {
        return courseObjectiveMappingRepository.save(mapping);
    }

    public CourseObjectiveMapping createMappingFromDTO(CourseObjectiveMappingDTO dto) {
        CourseObjectiveMapping mapping = new CourseObjectiveMapping();
        
        // Fetch and set course
        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));
            mapping.setCourse(course);
        }
        
        // Fetch and set objective
        if (dto.getObjectiveId() != null) {
            LearningObjective objective = learningObjectiveRepository.findById(dto.getObjectiveId())
                    .orElseThrow(() -> new RuntimeException("Learning Objective not found with id: " + dto.getObjectiveId()));
            mapping.setObjective(objective);
        }
        
        return courseObjectiveMappingRepository.save(mapping);
    }

    public CourseObjectiveMapping updateMapping(Long id, CourseObjectiveMapping mappingDetails) {
        CourseObjectiveMapping mapping = courseObjectiveMappingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mapping not found with id: " + id));
        
        if (mappingDetails.getCourse() != null) {
            mapping.setCourse(mappingDetails.getCourse());
        }
        if (mappingDetails.getObjective() != null) {
            mapping.setObjective(mappingDetails.getObjective());
        }
        
        return courseObjectiveMappingRepository.save(mapping);
    }

    public CourseObjectiveMapping updateMappingFromDTO(Long id, CourseObjectiveMappingDTO dto) {
        return courseObjectiveMappingRepository.findById(id).map(mapping -> {
            // Update course if provided
            if (dto.getCourseId() != null) {
                Course course = courseRepository.findById(dto.getCourseId())
                        .orElseThrow(() -> new RuntimeException("Course not found"));
                mapping.setCourse(course);
            }
            
            // Update objective if provided
            if (dto.getObjectiveId() != null) {
                LearningObjective objective = learningObjectiveRepository.findById(dto.getObjectiveId())
                        .orElseThrow(() -> new RuntimeException("Learning Objective not found"));
                mapping.setObjective(objective);
            }
            
            return courseObjectiveMappingRepository.save(mapping);
        }).orElseThrow(() -> new RuntimeException("Mapping not found"));
    }

    public void deleteMapping(Long id) {
        courseObjectiveMappingRepository.deleteById(id);
    }

    public List<CourseObjectiveMapping> getMappingsByCourse(Long courseId) {
        return courseObjectiveMappingRepository.findAll().stream()
                .filter(m -> m.getCourse().getId().equals(courseId))
                .toList();
    }

    public List<CourseObjectiveMapping> getMappingsByObjective(Long objectiveId) {
        return courseObjectiveMappingRepository.findAll().stream()
                .filter(m -> m.getObjective().getId().equals(objectiveId))
                .toList();
    }

}

