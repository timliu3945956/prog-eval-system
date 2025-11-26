package com.progevalsystem.service;

import com.progevalsystem.dto.CourseResponseDTO;
import com.progevalsystem.entity.Course;
import com.progevalsystem.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public List<CourseResponseDTO> getAllCoursesAsDTO() {
        return courseRepository.findAllWithDegreeMappings().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CourseResponseDTO convertToDTO(Course course) {
        CourseResponseDTO dto = new CourseResponseDTO();
        dto.setId(course.getId());
        dto.setCourseNumber(course.getCourseNumber());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        
        // Extract degreeId from first degree mapping
        if (course.getDegreeMappings() != null && !course.getDegreeMappings().isEmpty()) {
            dto.setDegreeId(course.getDegreeMappings().get(0).getDegree().getId());
        }
        
        return dto;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Course courseDetails) {
        return courseRepository.findById(id).map(course -> {
            course.setCourseNumber(courseDetails.getCourseNumber());
            course.setTitle(courseDetails.getTitle());
            course.setDescription(courseDetails.getDescription());
            return courseRepository.save(course);
        }).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public Optional<Course> getCourseByCourseNumber(String courseNumber) {
        return courseRepository.findByCourseNumber(courseNumber);
    }

}
