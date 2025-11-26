package com.progevalsystem.service;

import com.progevalsystem.dto.DegreeCourseMappingDTO;
import com.progevalsystem.entity.Course;
import com.progevalsystem.entity.Degree;
import com.progevalsystem.entity.DegreeCourseMappings;
import com.progevalsystem.repository.CourseRepository;
import com.progevalsystem.repository.DegreeCourseMappingsRepository;
import com.progevalsystem.repository.DegreeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DegreeCourseMappingService {

    @Autowired
    private DegreeCourseMappingsRepository mappingRepository;

    @Autowired
    private DegreeRepository degreeRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<DegreeCourseMappingDTO> getAllMappingsAsDTO() {
        return mappingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private DegreeCourseMappingDTO convertToDTO(DegreeCourseMappings mapping) {
        DegreeCourseMappingDTO dto = new DegreeCourseMappingDTO();
        dto.setId(mapping.getId());
        if (mapping.getDegree() != null) {
            dto.setDegreeId(mapping.getDegree().getId());
        }
        if (mapping.getCourse() != null) {
            dto.setCourseId(mapping.getCourse().getId());
        }
        dto.setIsCore(mapping.getIsCore());
        return dto;
    }

    public List<DegreeCourseMappings> getAllMappings() {
        return mappingRepository.findAll();
    }

    public Optional<DegreeCourseMappings> getMappingById(Long id) {
        return mappingRepository.findById(id);
    }

    public DegreeCourseMappings createMappingFromDTO(DegreeCourseMappingDTO dto) {
        DegreeCourseMappings mapping = new DegreeCourseMappings();
        
        if (dto.getDegreeId() != null) {
            Degree degree = degreeRepository.findById(dto.getDegreeId())
                    .orElseThrow(() -> new RuntimeException("Degree not found with id: " + dto.getDegreeId()));
            mapping.setDegree(degree);
        }
        
        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));
            mapping.setCourse(course);
        }
        
        mapping.setIsCore(dto.getIsCore() != null ? dto.getIsCore() : false);
        
        return mappingRepository.save(mapping);
    }

    public DegreeCourseMappings updateMappingFromDTO(Long id, DegreeCourseMappingDTO dto) {
        return mappingRepository.findById(id).map(mapping -> {
            if (dto.getDegreeId() != null) {
                Degree degree = degreeRepository.findById(dto.getDegreeId())
                        .orElseThrow(() -> new RuntimeException("Degree not found"));
                mapping.setDegree(degree);
            }
            
            if (dto.getCourseId() != null) {
                Course course = courseRepository.findById(dto.getCourseId())
                        .orElseThrow(() -> new RuntimeException("Course not found"));
                mapping.setCourse(course);
            }
            
            if (dto.getIsCore() != null) {
                mapping.setIsCore(dto.getIsCore());
            }
            
            return mappingRepository.save(mapping);
        }).orElseThrow(() -> new RuntimeException("Mapping not found"));
    }

    public void deleteMapping(Long id) {
        mappingRepository.deleteById(id);
    }

    public List<DegreeCourseMappings> getMappingsByDegree(Long degreeId) {
        return mappingRepository.findByDegreeId(degreeId);
    }

    public List<DegreeCourseMappings> getMappingsByCourse(Long courseId) {
        return mappingRepository.findByCourseId(courseId);
    }
}
