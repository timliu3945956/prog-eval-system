package com.progevalsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "learning_objectives")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningObjective {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g., LO-1 (globally unique)

    @Column(nullable = false, length = 120)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @OneToMany(mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CourseObjectiveMapping> courseMappings;

    @OneToMany(mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Evaluation> evaluations;

}
