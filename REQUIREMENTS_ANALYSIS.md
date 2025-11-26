# Program Evaluation System - Requirements Analysis

## Executive Summary
The current implementation has significant gaps in the evaluation system compared to the stated requirements. The system needs to be restructured to properly handle:
1. Multiple performance levels per objective (A, B, C, F counts)
2. Assessment method selection per objective
3. Multi-degree course associations with degree-specific evaluations
4. Proper validation constraints

---

## CRITICAL ISSUES IDENTIFIED

### Issue 1: Database Schema Mismatch
**Current State:** The `evaluations` table does NOT have the `degree_id` column that the Evaluation entity requires.

**Problem:**
- The SQL schema file shows no `degree_id` column in the evaluations table
- The Evaluation entity has `@JoinColumn(name = "degree_id")` expecting this column
- This causes a database mapping error

**Required Fix:**
- Add `degree_id BIGINT NOT NULL` to evaluations table
- Add foreign key constraint: `FOREIGN KEY (degree_id) REFERENCES degrees(id)`
- Update unique constraint to: `UNIQUE KEY unique_section_objective_degree (section_id, objective_id, degree_id)`

---

### Issue 2: LearningObjective Entity Design Flaw
**Current State:** Learning objectives are defined with a `degree_id` column.

**Problem:**
- Creates a 1-to-1 relationship between objectives and degrees
- Violates requirement that "Each objective must be associated with at least ONE course"
- When an objective is associated with multiple courses across different degrees, this model breaks
- Prevents sharing of common learning objectives across degree programs

**Correct Model:**
- Learning objectives should be **degree-independent**
- Objectives are shared across all degrees
- The `course_objective_mappings` table already correctly maps objectives to courses
- Degrees implicitly use objectives through their courses

**Required Changes:**
- Remove `degree_id` column from learning_objectives table
- Remove `@ManyToOne Degree degree` from LearningObjective entity
- Remove the unique constraint on `(code, degree_id)`
- Update the `code` column to be globally unique: `ALTER TABLE learning_objectives ADD UNIQUE(code)`

---

### Issue 3: Section-Degree Relationship Problem
**Current State:** Sections have a direct `degree_id` FK, but the actual relationship is through `course_id`.

**Problem:**
- A section should represent a specific instance of a course taught in a semester
- The same section (same course, semester, instructor) can serve multiple degrees
- Currently restricting one section to one degree creates data duplication
- If course CS 5330 is required in both MS and BS degrees, there should be only ONE section object, not two

**Requirement Mismatch:**
- Requirement: "For the SAME section, evaluations for the same objective may DIFFER across different degrees"
- This can only happen if evaluations are degree-specific, not sections

**Required Fix:**
- Remove `degree_id` from sections table (it's already implicit through course mappings)
- Keep sections as course+semester+instructor instances
- Let evaluations carry the degree_id to handle degree-specific evaluation data

---

### Issue 4: Frontend Form Structure - Completely Wrong for Requirements
**Current State:** The EvaluationManager form is overly simplistic and incorrect.

**Problems:**
1. Form only captures: Degree, Semester, Instructor, Section, Score
2. Does NOT capture:
   - Learning Objectives associated with the course
   - Assessment method (required field per requirement)
   - Performance level counts (A, B, C, F)
   - Comments/Improvement suggestions
3. The "Score" field is a generic text input for undefined data
4. No interface to enter performance level distributions
5. No way to select from standard assessment methods
6. Form structure doesn't support "per-objective" evaluations
7. Frontend has NO logic to show course's learning objectives
8. No validation that course has at least one objective

**Correct Form Flow Should Be:**
1. Instructor selects: Degree → Semester → Section (filtered by degree/course)
2. System shows: All learning objectives for that course
3. For EACH objective, instructor enters:
   - Assessment method (dropdown: Homework, Project, Quiz, Oral Presentation, Report, Mid-term, Final Exam, Custom)
   - Count of students achieving A
   - Count of students achieving B
   - Count of students achieving C
   - Count of students achieving F
   - Optional improvement comments
4. Each (section, objective, degree) combination creates ONE evaluation record

---

### Issue 5: Validation Constraints Missing
**Current State:** No validation in code or database schema.

**Missing Validations:**
1. **Core course requirement:** Each core course must have at least ONE learning objective
   - Not enforced in schema
   - Not enforced in service layer
2. **Objective requirement:** Each learning objective must have at least ONE course
   - Not enforced in schema
   - Not enforced in service layer
3. **Performance level constraints:** Sum of (countA + countB + countC + countF) should not exceed enrollment
   - No validation exists
4. **Unique constraint:** Same (section, objective, degree) should not have multiple evaluations
   - Database has the constraint but implementation may not enforce it properly

**Required Fixes:**
- Add database constraints
- Add service layer validation
- Add frontend validation

---

### Issue 6: Learning Objective Uniqueness
**Current State:** Code is unique per degree (composite constraint).

**Problem:**
- If objectives are global (not degree-specific), code should be globally unique
- Current uniqueness prevents using same objective code across degrees

**Required Fix:**
- Change constraint from `UNIQUE(code, degree_id)` to `UNIQUE(code)`

---

## DETAILED CHANGE LIST

### A. DATABASE SCHEMA CHANGES

#### 1. **evaluations table**
```sql
-- ADD degree_id column (currently missing!)
ALTER TABLE evaluations ADD COLUMN degree_id BIGINT NOT NULL AFTER objective_id;
ALTER TABLE evaluations ADD CONSTRAINT fk_evaluations_degree 
  FOREIGN KEY (degree_id) REFERENCES degrees(id);

-- UPDATE unique constraint
ALTER TABLE evaluations DROP INDEX unique_section_objective;
ALTER TABLE evaluations ADD UNIQUE KEY unique_section_objective_degree 
  (section_id, objective_id, degree_id);
```

#### 2. **sections table**
```sql
-- REMOVE degree_id (sections are not degree-specific, only courses are)
ALTER TABLE sections DROP FOREIGN KEY sections_ibfk_1;
ALTER TABLE sections DROP COLUMN degree_id;
```

#### 3. **learning_objectives table**
```sql
-- REMOVE degree_id (objectives are global, not degree-specific)
ALTER TABLE learning_objectives DROP FOREIGN KEY fk_learning_objectives_degree;
ALTER TABLE learning_objectives DROP CONSTRAINT unique_code_degree;
ALTER TABLE learning_objectives DROP COLUMN degree_id;

-- Make code globally unique
ALTER TABLE learning_objectives ADD UNIQUE KEY unique_code (code);
```

#### 4. **Add validation constraints**
```sql
-- Ensure performance counts are non-negative
ALTER TABLE evaluations 
  ADD CONSTRAINT check_count_a CHECK (countA >= 0),
  ADD CONSTRAINT check_count_b CHECK (countB >= 0),
  ADD CONSTRAINT check_count_c CHECK (countC >= 0),
  ADD CONSTRAINT check_count_f CHECK (countF >= 0);
```

---

### B. BACKEND ENTITY CHANGES

#### 1. **LearningObjective.java**
**Remove:**
- `@ManyToOne Degree degree` and `@JoinColumn(name = "degree_id")`
- `degree_id` from unique constraint in `@Table` annotation

**Keep:**
- Everything else (code, title, description, courseMappings, evaluations)

#### 2. **Section.java**
**Remove:**
- `@ManyToOne Degree degree` and `@JoinColumn(name = "degree_id")`
- Section no longer represents a degree-specific section

#### 3. **Evaluation.java**
**Already correct!** Has:
- ✅ `section_id` FK
- ✅ `objective_id` FK  
- ✅ `degree_id` FK
- ✅ `assessmentMethod` field
- ✅ `countA, countB, countC, countF` fields
- ✅ `comments` field
- ✅ Proper unique constraint
- ✅ Audit timestamps

**Only addition needed:**
- Add validation constraints in entity

#### 4. **Course.java**
**No changes needed** - already has relationship to objectives via `objectiveMappings`

#### 5. **Degree.java**
**No changes needed** - but remove reference to evaluations list since relationship will be maintained through other tables

#### 6. **Instructor.java**
**No changes needed**

#### 7. **DegreeCourseMappings.java**
**No changes needed** - correctly models which courses are in which degrees

---

### C. BACKEND DTO CHANGES

#### 1. **EvaluationDTO.java**
**Already correct!** Contains all necessary fields:
- sectionId, objectiveId, degreeId
- assessmentMethod
- countA, countB, countC, countF
- comments

#### 2. **EvaluationResponseDTO.java**
**Already mostly correct!** Add missing fields if needed:
- Ensure it includes `assessmentMethod` and all count fields

---

### D. BACKEND SERVICE/CONTROLLER CHANGES

#### 1. **EvaluationService.java**
**Add validation methods:**
- `validateObjectiveHasAtLeastOneCourse(objectiveId)` - throws if objective has no courses
- `validateCourseHasAtLeastOneObjective(courseId)` - throws if core course has no objectives
- `validatePerformanceCounts(evaluation)` - ensures counts are non-negative and reasonable
- `validateEvaluationData(evaluationDTO)` - orchestrates all validations

**Update CRUD methods:**
- In `create()`: call validation before saving
- In `update()`: call validation before saving

#### 2. **EvaluationController.java**
**Update endpoints:**
- Ensure `POST /api/evaluations` and `PUT /api/evaluations/{id}` call validation
- Return appropriate error responses for validation failures

#### 3. **LearningObjectiveService/Controller**
**Add validation:**
- When creating objective: validate all constraints
- When creating course: validate has at least one objective (for core courses)

#### 4. **CourseService**
**Add validation on save:**
- If course is marked as core: must have at least one learning objective

---

### E. FRONTEND COMPONENT CHANGES (Critical)

#### **EvaluationManager.jsx** - MAJOR RESTRUCTURING NEEDED

**Current problems:**
1. Form captures wrong data
2. No objective selection/display
3. No assessment method selection
4. No performance level input fields
5. No comments field

**Required new structure:**

**Step 1: Section Selection (Current - OK)**
```
Degree → Semester → Instructor → Section
```

**Step 2: Objectives & Evaluation Data (NEW - REQUIRED)**
```
After section selected, show:
- List of all learning objectives for that course
- For each objective, show form with:
  * Assessment Method: <dropdown with standard options + custom>
  * Count A: <number input>
  * Count B: <number input>
  * Count C: <number input>
  * Count F: <number input>
  * Improvement Comments: <textarea>
  * Save button for this objective
```

**Form data structure needed:**
```javascript
formData = {
  degreeId: '',
  semester: '',
  instructorId: '',
  sectionId: '',
  selectedObjective: {
    objectiveId: '',
    assessmentMethod: '',
    countA: 0,
    countB: 0,
    countC: 0,
    countF: 0,
    comments: ''
  }
}
```

**New state variables needed:**
- `courseObjectives: []` - objectives for selected course
- `completedObjectives: {}` - track which objectives have evaluations
- `assessmentMethods: ['Homework', 'Project', 'Quiz', 'Oral Presentation', 'Report', 'Mid-term', 'Final Exam']`

**New functions needed:**
- `getCourseObjectives(courseId)` - fetch objectives for a course
- `getObjectiveStatus(sectionId, objectiveId, degreeId)` - check if evaluation exists
- `submitObjectiveEvaluation(evaluationData)` - save evaluation with all fields
- `validatePerformanceCounts()` - ensure counts are valid
- `calculateTotalStudentsRated()` - sum of all counts

**UI improvements:**
- Show progress: "3 of 5 objectives evaluated"
- Visual indicators for completed vs pending objectives
- Validation messages for invalid inputs
- Show enrollment number for reference when entering counts

---

## SUMMARY TABLE OF ALL CHANGES

| Layer | Component | Current State | Required Change | Priority |
|-------|-----------|---------------|-----------------|----------|
| **DB** | evaluations | Missing `degree_id` | Add column + FK + constraint | **CRITICAL** |
| **DB** | sections | Has `degree_id` | Remove column + FK | **CRITICAL** |
| **DB** | learning_objectives | Has `degree_id` | Remove column + constraint | **CRITICAL** |
| **Backend** | LearningObjective.java | Has degree ref | Remove @ManyToOne degree | **CRITICAL** |
| **Backend** | Section.java | Has degree ref | Remove @ManyToOne degree | **CRITICAL** |
| **Backend** | Evaluation.java | Correct structure | Add validation annotations | High |
| **Backend** | Service layer | No validation | Add 4+ validation methods | High |
| **Backend** | DTOs | Mostly correct | Verify all fields present | Medium |
| **Frontend** | EvaluationManager | Wrong form structure | Complete redesign of form | **CRITICAL** |
| **Frontend** | Form flow | Section only | Add objective selection + data entry | **CRITICAL** |
| **Frontend** | Data capture | Generic "score" | Add assessment method + counts | **CRITICAL** |

---

## IMPLEMENTATION ORDER

1. **First: Database schema fixes** (sections and learning_objectives are foundational)
2. **Second: Entity model fixes** (Section and LearningObjective classes)
3. **Third: Evaluation entity validation** 
4. **Fourth: Service layer validation**
5. **Fifth: Frontend restructuring** (must happen after backend changes)
6. **Finally: End-to-end testing** with multiple degrees and courses

---

## VALIDATION RULES TO IMPLEMENT

```
1. When saving evaluation:
   ✓ section exists
   ✓ objective exists and belongs to course in section
   ✓ degree exists
   ✓ assessmentMethod is not empty
   ✓ countA, countB, countC, countF are all >= 0
   ✓ sum(counts) <= section.enrollment
   ✓ (sectionId, objectiveId, degreeId) is unique

2. When updating course-objective mapping:
   ✓ If course is core, must have at least 1 objective after deletion

3. When updating learning objective:
   ✓ After update, objective must have at least 1 course

4. When creating course:
   ✓ If marked as core for any degree, must have at least 1 objective
```

