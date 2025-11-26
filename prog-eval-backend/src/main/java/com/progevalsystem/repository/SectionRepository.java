package com.progevalsystem.repository;

import com.progevalsystem.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByCourseId(Long courseId);
    List<Section> findByInstructorId(Long instructorId);
    List<Section> findBySemester(String semester);
    
    @Query("SELECT s FROM Section s WHERE s.instructor.instructorId = :instructorId OR s.instructor.name LIKE %:searchTerm%")
    List<Section> findByInstructorSearchTerm(@Param("instructorId") String instructorId, @Param("searchTerm") String searchTerm);
}
