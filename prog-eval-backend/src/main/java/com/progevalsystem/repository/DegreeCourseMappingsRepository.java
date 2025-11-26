package com.progevalsystem.repository;

import com.progevalsystem.entity.DegreeCourseMappings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DegreeCourseMappingsRepository extends JpaRepository<DegreeCourseMappings, Long> {
    List<DegreeCourseMappings> findByDegreeId(Long degreeId);
    List<DegreeCourseMappings> findByCourseId(Long courseId);
}
