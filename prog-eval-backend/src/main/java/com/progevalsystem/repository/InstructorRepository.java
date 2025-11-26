package com.progevalsystem.repository;

import com.progevalsystem.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {
    Optional<Instructor> findByInstructorId(String instructorId);
    Optional<Instructor> findByName(String name);
}
