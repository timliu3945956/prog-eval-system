package com.progevalsystem.service;

import com.progevalsystem.dto.SectionDTO;
import com.progevalsystem.dto.SectionResponseDTO;
import com.progevalsystem.entity.Course;
import com.progevalsystem.entity.Instructor;
import com.progevalsystem.entity.Section;
import com.progevalsystem.repository.CourseRepository;
import com.progevalsystem.repository.InstructorRepository;
import com.progevalsystem.repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    public List<SectionResponseDTO> getAllSectionsAsDTO() {
        return sectionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private SectionResponseDTO convertToDTO(Section section) {
        SectionResponseDTO dto = new SectionResponseDTO();
        dto.setId(section.getId());
        dto.setSemester(section.getSemester());
        dto.setSectionNumber(section.getSectionNumber());
        dto.setEnrollment(section.getEnrollment());
        
        if (section.getCourse() != null) {
            dto.setCourseId(section.getCourse().getId());
            dto.setCourseNumber(section.getCourse().getCourseNumber());
            dto.setCourseTitle(section.getCourse().getTitle());
        }
        
        if (section.getInstructor() != null) {
            dto.setInstructorId(section.getInstructor().getId());
            dto.setInstructorName(section.getInstructor().getName());
        }
        
        return dto;
    }

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    public Optional<Section> getSectionById(Long id) {
        return sectionRepository.findById(id);
    }

    public Section createSection(Section section) {
        // If course ID is set, fetch the course entity
        if (section.getCourse() != null && section.getCourse().getId() != null) {
            Course course = courseRepository.findById(section.getCourse().getId())
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + section.getCourse().getId()));
            section.setCourse(course);
        }
        
        // If instructor ID is set, fetch the instructor entity
        if (section.getInstructor() != null && section.getInstructor().getId() != null) {
            Instructor instructor = instructorRepository.findById(section.getInstructor().getId())
                    .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + section.getInstructor().getId()));
            section.setInstructor(instructor);
        }
        
        return sectionRepository.save(section);
    }

    public Section updateSection(Long id, Section sectionDetails) {
        return sectionRepository.findById(id).map(section -> {
            section.setSemester(sectionDetails.getSemester());
            section.setSectionNumber(sectionDetails.getSectionNumber());
            section.setEnrollment(sectionDetails.getEnrollment());
            
            // Update course if provided
            if (sectionDetails.getCourse() != null && sectionDetails.getCourse().getId() != null) {
                Course course = courseRepository.findById(sectionDetails.getCourse().getId())
                        .orElseThrow(() -> new RuntimeException("Course not found"));
                section.setCourse(course);
            }
            
            // Update instructor if provided
            if (sectionDetails.getInstructor() != null && sectionDetails.getInstructor().getId() != null) {
                Instructor instructor = instructorRepository.findById(sectionDetails.getInstructor().getId())
                        .orElseThrow(() -> new RuntimeException("Instructor not found"));
                section.setInstructor(instructor);
            }
            
            return sectionRepository.save(section);
        }).orElseThrow(() -> new RuntimeException("Section not found"));
    }

    public void deleteSection(Long id) {
        sectionRepository.deleteById(id);
    }

    public List<Section> getSectionsByCourse(Long courseId) {
        return sectionRepository.findByCourseId(courseId);
    }

    public List<Section> getSectionsByInstructor(Long instructorId) {
        return sectionRepository.findByInstructorId(instructorId);
    }

    public List<Section> getSectionsBySemester(String semester) {
        return sectionRepository.findBySemester(semester);
    }

    public Section createSectionFromDTO(SectionDTO dto) {
        try {
            Section section = new Section();
            section.setSemester(dto.getSemester());
            section.setSectionNumber(dto.getSectionNumber());
            section.setEnrollment(dto.getEnrollment());
            
            // Fetch and set course
            if (dto.getCourseId() != null) {
                Course course = courseRepository.findById(dto.getCourseId())
                        .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));
                section.setCourse(course);
            }
            
            // Fetch and set instructor
            if (dto.getInstructorId() != null) {
                Instructor instructor = instructorRepository.findById(dto.getInstructorId())
                        .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + dto.getInstructorId()));
                section.setInstructor(instructor);
            }
            
            return sectionRepository.save(section);
        } catch (Exception e) {
            System.err.println("Error creating section: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create section: " + e.getMessage());
        }
    }

    public Section updateSectionFromDTO(Long id, SectionDTO dto) {
        return sectionRepository.findById(id).map(section -> {
            section.setSemester(dto.getSemester());
            section.setSectionNumber(dto.getSectionNumber());
            section.setEnrollment(dto.getEnrollment());
            
            // Update course if provided
            if (dto.getCourseId() != null) {
                Course course = courseRepository.findById(dto.getCourseId())
                        .orElseThrow(() -> new RuntimeException("Course not found"));
                section.setCourse(course);
            }
            
            // Update instructor if provided
            if (dto.getInstructorId() != null) {
                Instructor instructor = instructorRepository.findById(dto.getInstructorId())
                        .orElseThrow(() -> new RuntimeException("Instructor not found"));
                section.setInstructor(instructor);
            }
            
            return sectionRepository.save(section);
        }).orElseThrow(() -> new RuntimeException("Section not found"));
    }

}
