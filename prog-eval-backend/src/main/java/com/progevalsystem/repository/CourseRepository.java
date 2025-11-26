package com.progevalsystem.repository;

import com.progevalsystem.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseNumber(String courseNumber);
    
    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.degreeMappings")
    List<Course> findAllWithDegreeMappings();
}
