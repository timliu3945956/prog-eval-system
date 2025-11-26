# Database Schema for Program Evaluation System

CREATE DATABASE IF NOT EXISTS prog_eval_system;
USE prog_eval_system;

-- Create degrees table
CREATE TABLE degrees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    core_objectives TEXT
);

-- Create courses table
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create instructors table
CREATE TABLE instructors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    instructor_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    department VARCHAR(255)
);

-- Create learning_objectives table
CREATE TABLE learning_objectives (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT
);

-- Create sections table
CREATE TABLE sections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    instructor_id BIGINT NOT NULL,
    semester VARCHAR(50) NOT NULL,
    section_number VARCHAR(50) NOT NULL,
    enrollment INT,
    FOREIGN KEY (degree_id) REFERENCES degrees(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (instructor_id) REFERENCES instructors(id)
);

-- Create evaluations table
CREATE TABLE evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    section_id BIGINT NOT NULL,
    objective_id BIGINT NOT NULL,
    evaluation_status VARCHAR(50) NOT NULL,
    success_threshold INT,
    improvement_note TEXT,
    evaluation_data LONGTEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (objective_id) REFERENCES learning_objectives(id)
);

-- Create degree_course_mappings table
CREATE TABLE degree_course_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    is_core BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (degree_id) REFERENCES degrees(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Create course_objective_mappings table
CREATE TABLE course_objective_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    objective_id BIGINT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (objective_id) REFERENCES learning_objectives(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_objective (course_id, objective_id),
    INDEX idx_course_id (course_id),
    INDEX idx_objective_id (objective_id)
);

-- Insert sample data
INSERT INTO degrees (name, level, core_objectives) VALUES 
    ('Master of Science in Computer Science', 'MS', 'LO-1, LO-2'),
    ('Bachelor of Science in Computer Science', 'BS', 'LO-1, LO-3'),
    ('Certificate in Data Science', 'Cert', 'LO-2');

INSERT INTO courses (course_number, title, description) VALUES 
    ('CS 5330', 'Program Evaluation', 'Learn program evaluation techniques'),
    ('CS 6120', 'Advanced Databases', 'Advanced database design and optimization'),
    ('CS 5000', 'Foundations', 'Computer science foundations');

INSERT INTO instructors (instructor_id, name, email, department) VALUES 
    ('000123', 'Dr. Jane Doe', 'jane@university.edu', 'Computer Science'),
    ('000456', 'Dr. John Smith', 'john@university.edu', 'Computer Science'),
    ('000789', 'Prof. Sarah Lee', 'sarah@university.edu', 'Computer Science');

INSERT INTO learning_objectives (code, title, description) VALUES 
    ('LO-1', 'Design Database Schemas', 'Students can design efficient relational database schemas'),
    ('LO-2', 'Implement Database Systems', 'Students can implement functional database systems'),
    ('LO-3', 'Analyze Program Quality', 'Students can analyze and assess program quality metrics');

INSERT INTO degree_course_mappings (degree_id, course_id, is_core) VALUES 
    (1, 1, TRUE),   -- MS has CS 5330 as core
    (1, 2, TRUE),   -- MS has CS 6120 as core
    (2, 1, FALSE),  -- BS has CS 5330 but not core
    (3, 2, TRUE);   -- Cert has CS 6120 as core

INSERT INTO course_objective_mappings (course_id, objective_id) VALUES 
    (1, 1),  -- CS 5330 maps to LO-1
    (1, 3),  -- CS 5330 maps to LO-3
    (2, 1),  -- CS 6120 maps to LO-1
    (2, 2);  -- CS 6120 maps to LO-2
