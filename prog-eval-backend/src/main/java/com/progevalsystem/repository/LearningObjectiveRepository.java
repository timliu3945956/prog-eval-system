package com.progevalsystem.repository;

import com.progevalsystem.entity.LearningObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LearningObjectiveRepository extends JpaRepository<LearningObjective, Long> {
    Optional<LearningObjective> findByCode(String code);
}

