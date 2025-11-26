package com.progevalsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "evaluations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"section_id", "objective_id", "degree_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @JsonIgnore
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "objective_id", nullable = false)
    @JsonIgnore
    private LearningObjective objective;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "degree_id", nullable = false)
    @JsonIgnore
    private Degree degree;

    @Column(nullable = false)
    private String assessmentMethod; // e.g., "Homework", "Project", "Quiz", "Oral Presentation", "Report", "Mid-term", "Final Exam"

    @Column(nullable = false)
    private Integer countA = 0; // Number of students achieving A

    @Column(nullable = false)
    private Integer countB = 0; // Number of students achieving B

    @Column(nullable = false)
    private Integer countC = 0; // Number of students achieving C

    @Column(nullable = false)
    private Integer countF = 0; // Number of students achieving F

    @Column(columnDefinition = "LONGTEXT")
    private String comments; // Improvement suggestions

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
