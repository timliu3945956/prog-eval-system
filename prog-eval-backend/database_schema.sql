-- ============================================================================
-- COMPLETE DATABASE SCHEMA FOR PROGRAM EVALUATION SYSTEM
-- ============================================================================
-- This is the CORRECTED version with all project requirements implemented:
-- - Sections are NOT degree-specific (one section per course/semester/instructor)
-- - Learning Objectives are global/shared (not degree-specific)
-- - Evaluations store: assessment method, counts (A/B/C/F), and comments
-- - Same section can have different evaluations per degree

DROP DATABASE IF EXISTS prog_eval_system;
CREATE DATABASE IF NOT EXISTS prog_eval_system;
USE prog_eval_system;

-- ============================================================================
-- TABLE: degrees
-- ============================================================================
CREATE TABLE degrees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL COMMENT 'BA, BS, MS, PhD, Cert',
    UNIQUE KEY uk_degree_name_level (name, level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: courses
-- ============================================================================
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_number VARCHAR(20) NOT NULL UNIQUE COMMENT '2-4 letter code + 4-digit number',
    title VARCHAR(255) NOT NULL UNIQUE,
    description LONGTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: instructors
-- ============================================================================
CREATE TABLE instructors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    instructor_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    department VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: learning_objectives (GLOBAL/SHARED - NOT degree-specific)
-- ============================================================================
CREATE TABLE learning_objectives (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g., LO-1, LO-2 (globally unique)',
    title VARCHAR(120) NOT NULL COMMENT '120 character limit as per spec',
    description LONGTEXT,
    UNIQUE KEY uk_objective_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: sections (NOT degree-specific - one section per course/semester/instructor)
-- ============================================================================
CREATE TABLE sections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL COMMENT 'Which course is being offered',
    instructor_id BIGINT NOT NULL COMMENT 'Who teaches this section',
    semester VARCHAR(50) NOT NULL COMMENT 'e.g., Fall 2024, Spring 2025',
    section_number VARCHAR(50) NOT NULL COMMENT 'e.g., 101, 102',
    enrollment INT COMMENT 'Number of students enrolled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    UNIQUE KEY uk_section_unique (course_id, instructor_id, semester, section_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: evaluations (Per-objective evaluation per section per degree)
-- ============================================================================
-- KEY CONCEPT: Same section can have DIFFERENT evaluations per degree
-- Example: CS 5330 Fall 2024 taught by Dr. Doe is ONE section
--          But has separate evaluations for MS, BS, and Cert degrees
-- ============================================================================
CREATE TABLE evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    section_id BIGINT NOT NULL COMMENT 'Which section/course instance',
    objective_id BIGINT NOT NULL COMMENT 'Which learning objective being evaluated',
    degree_id BIGINT NOT NULL COMMENT 'CRITICAL: Which degree program this evaluation is for',
    assessment_method VARCHAR(100) NOT NULL COMMENT 'Homework, Project, Quiz, Oral Presentation, Report, Mid-term, Final Exam, Other',
    count_a INT NOT NULL DEFAULT 0 COMMENT 'Number of students achieving A',
    count_b INT NOT NULL DEFAULT 0 COMMENT 'Number of students achieving B',
    count_c INT NOT NULL DEFAULT 0 COMMENT 'Number of students achieving C',
    count_f INT NOT NULL DEFAULT 0 COMMENT 'Number of students achieving F (or below passing)',
    comments LONGTEXT COMMENT 'Improvement suggestions and notes for this objective in this course',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (objective_id) REFERENCES learning_objectives(id) ON DELETE CASCADE,
    FOREIGN KEY (degree_id) REFERENCES degrees(id) ON DELETE CASCADE,
    UNIQUE KEY uk_eval_unique (section_id, objective_id, degree_id) COMMENT 'One evaluation per section/objective/degree',
    INDEX idx_degree_id (degree_id),
    INDEX idx_section_id (section_id),
    INDEX idx_objective_id (objective_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: degree_course_mappings (Which courses are in which degrees)
-- ============================================================================
CREATE TABLE degree_course_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    is_core BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Is this a core course for the degree?',
    FOREIGN KEY (degree_id) REFERENCES degrees(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_degree_course (degree_id, course_id),
    INDEX idx_is_core (is_core)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: course_objective_mappings (Which objectives are associated with which courses)
-- ============================================================================
CREATE TABLE course_objective_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    objective_id BIGINT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (objective_id) REFERENCES learning_objectives(id) ON DELETE CASCADE,
    UNIQUE KEY uk_course_objective (course_id, objective_id),
    INDEX idx_course_id (course_id),
    INDEX idx_objective_id (objective_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Insert degrees
INSERT INTO degrees (name, level) VALUES 
    ('Master of Science in Computer Science', 'MS'),
    ('Bachelor of Science in Computer Science', 'BS'),
    ('Certificate in Data Science', 'Cert');

-- Insert courses
INSERT INTO courses (course_number, title, description) VALUES 
    ('CS 5330', 'Program Evaluation', 'Learn program evaluation techniques and assessment methods'),
    ('CS 6120', 'Advanced Databases', 'Advanced database design and optimization'),
    ('CS 5000', 'Foundations', 'Computer science foundations and theory');

-- Insert instructors
INSERT INTO instructors (instructor_id, name, email, department) VALUES 
    ('000123', 'Dr. Jane Doe', 'jane@university.edu', 'Computer Science'),
    ('000456', 'Dr. John Smith', 'john@university.edu', 'Computer Science'),
    ('000789', 'Prof. Sarah Lee', 'sarah@university.edu', 'Computer Science');

-- Insert learning objectives (GLOBAL - not degree-specific)
INSERT INTO learning_objectives (code, title, description) VALUES 
    ('LO-1', 'Design Database Schemas', 'Students can design efficient and normalized relational database schemas'),
    ('LO-2', 'Implement Database Systems', 'Students can implement functional database systems with proper constraints'),
    ('LO-3', 'Analyze Program Quality', 'Students can analyze and assess program quality metrics and outcomes');

-- Insert degree-course mappings
INSERT INTO degree_course_mappings (degree_id, course_id, is_core) VALUES 
    (1, 1, TRUE),   -- MS: CS 5330 is CORE
    (1, 2, TRUE),   -- MS: CS 6120 is CORE
    (2, 1, FALSE),  -- BS: CS 5330 is NOT core
    (2, 3, TRUE),   -- BS: CS 5000 is CORE
    (3, 2, TRUE);   -- Cert: CS 6120 is CORE

-- Insert course-objective mappings
INSERT INTO course_objective_mappings (course_id, objective_id) VALUES 
    (1, 1),  -- CS 5330 teaches LO-1 (Design Database Schemas)
    (1, 3),  -- CS 5330 teaches LO-3 (Analyze Program Quality)
    (2, 1),  -- CS 6120 teaches LO-1 (Design Database Schemas)
    (2, 2),  -- CS 6120 teaches LO-2 (Implement Database Systems)
    (3, 1);  -- CS 5000 teaches LO-1 (Design Database Schemas)

-- Insert sample sections (one per course/semester/instructor)
INSERT INTO sections (course_id, instructor_id, semester, section_number, enrollment) VALUES 
    (1, 1, 'Fall 2024', '101', 25),    -- CS 5330 Fall 2024 by Dr. Doe
    (2, 2, 'Fall 2024', '101', 30),    -- CS 6120 Fall 2024 by Dr. Smith
    (3, 3, 'Spring 2025', '101', 20);  -- CS 5000 Spring 2025 by Prof. Lee

-- Insert sample evaluations
-- Key: Same section (CS 5330 Fall 2024) has DIFFERENT evaluations for MS, BS, Cert degrees
INSERT INTO evaluations (section_id, objective_id, degree_id, assessment_method, count_a, count_b, count_c, count_f, comments) VALUES 
    -- Section 1 (CS 5330 Fall 2024) evaluations for MS degree
    (1, 1, 1, 'Homework', 18, 5, 2, 0, 'Strong performance overall. Students excelled in schema design assignments.'),
    (1, 3, 1, 'Final Exam', 12, 10, 2, 1, 'Most students demonstrated program evaluation competency. Consider more case studies next semester.'),
    
    -- Section 1 (CS 5330 Fall 2024) evaluations for BS degree (DIFFERENT counts!)
    (1, 1, 2, 'Homework', 15, 7, 3, 0, 'Good foundation. Some students struggled with normalization.'),
    (1, 3, 2, 'Final Exam', 10, 12, 3, 0, 'BS students generally performed well but with less depth than MS.'),
    
    -- Section 2 (CS 6120 Fall 2024) evaluations for MS degree
    (2, 1, 1, 'Project', 20, 8, 2, 0, 'Excellent database design project submissions.'),
    (2, 2, 1, 'Mid-term', 15, 12, 2, 1, 'Strong implementation skills demonstrated.'),
    
    -- Section 3 (CS 5000 Spring 2025) evaluations for BS degree
    (3, 1, 2, 'Quiz', 14, 5, 1, 0, 'Solid understanding of foundational concepts.');

-- Verify the setup
SELECT 'Degrees' as 'Table';
SELECT COUNT(*) FROM degrees;
SELECT 'Courses' as 'Table';
SELECT COUNT(*) FROM courses;
SELECT 'Instructors' as 'Table';
SELECT COUNT(*) FROM instructors;
SELECT 'Learning Objectives' as 'Table';
SELECT COUNT(*) FROM learning_objectives;
SELECT 'Sections' as 'Table';
SELECT COUNT(*) FROM sections;
SELECT 'Evaluations' as 'Table';
SELECT COUNT(*) FROM evaluations;
SELECT 'Degree-Course Mappings' as 'Table';
SELECT COUNT(*) FROM degree_course_mappings;
SELECT 'Course-Objective Mappings' as 'Table';
SELECT COUNT(*) FROM course_objective_mappings;