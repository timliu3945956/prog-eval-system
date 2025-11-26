package com.progevalsystem.repository;

import com.progevalsystem.entity.CourseObjectiveMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseObjectiveMappingRepository extends JpaRepository<CourseObjectiveMapping, Long> {
    List<CourseObjectiveMapping> findByCourseId(Long courseId);
    List<CourseObjectiveMapping> findByObjectiveId(Long objectiveId);
}
