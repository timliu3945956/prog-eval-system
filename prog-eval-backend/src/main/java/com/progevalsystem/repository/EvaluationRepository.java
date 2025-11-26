package com.progevalsystem.repository;

import com.progevalsystem.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findBySectionId(Long sectionId);
    List<Evaluation> findByObjectiveId(Long objectiveId);
    List<Evaluation> findByDegreeId(Long degreeId);
    
    Optional<Evaluation> findBySectionIdAndObjectiveIdAndDegreeId(Long sectionId, Long objectiveId, Long degreeId);
    
    @Query("SELECT e FROM Evaluation e WHERE e.section.id = :sectionId AND e.degree.id = :degreeId")
    List<Evaluation> findBySectionAndDegree(@Param("sectionId") Long sectionId, @Param("degreeId") Long degreeId);
    
    @Query("SELECT e FROM Evaluation e LEFT JOIN FETCH e.section LEFT JOIN FETCH e.objective LEFT JOIN FETCH e.degree WHERE e.section.id = :sectionId AND e.degree.id = :degreeId")
    List<Evaluation> findBySectionAndDegreeWithEagerLoading(@Param("sectionId") Long sectionId, @Param("degreeId") Long degreeId);
}

