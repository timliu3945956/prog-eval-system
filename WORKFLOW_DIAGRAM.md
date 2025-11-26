# UI Workflow Diagram - Degree-Specific Evaluations

## Complete Flow with Example

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVALUATION MANAGER WORKFLOW                   │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ├─> [Filter Sections Screen]
  │   ├─ Degree (optional)
  │   ├─ Semester (optional)  
  │   ├─ Year (optional)
  │   └─ Instructor (optional)
  │
  └─> [Sections List]
      ├─ Section Cards showing:
      │  ├─ Course code
      │  ├─ Section number
      │  ├─ Semester/Instructor
      │  ├─ Enrollment
      │  └─ Progress bar (evaluations completed)
      │
      └─ User clicks "Add/Edit Evaluation"
         │
         ├─> [DEGREE SELECTION SCREEN] ← NEW STEP
         │   │
         │   ├─ Shows degree cards for all degrees teaching this course
         │   ├─ Each card displays:
         │   │  ├─ Degree name
         │   │  └─ Degree level
         │   │
         │   ├─ Example for CS101 section:
         │   │  ┌──────────────────────┐  ┌──────────────────────┐
         │   │  │ Bachelor of Science  │  │  Master of Science   │
         │   │  │  Undergraduate       │  │  Graduate            │
         │   │  └──────────────────────┘  └──────────────────────┘
         │   │
         │   └─ User clicks degree card
         │      │
         │      └─> Set selectedDegree = degree.id
         │          Call loadExistingEvaluations(section, degree)
         │
         └─> [OBJECTIVES LIST SCREEN]
             │
             ├─ Degree Header Banner:
             │  "Evaluating for: Bachelor of Science"
             │
             ├─ Back button: "← Back to Degree Selection"
             │
             ├─ Learning Objectives:
             │  ├─ Objective 1 (LO1)
             │  │  ├─ Code: LO-CS101-1
             │  │  ├─ Description: "Student will implement sorting..."
             │  │  ├─ Status badge (for THIS degree):
             │  │  │  ├─ If evaluation saved: ✓ Completed
             │  │  │  └─ If no evaluation: ○ Pending
             │  │  └─ [Edit Evaluation] button
             │  │
             │  ├─ Objective 2 (LO2)
             │  │  ├─ Code: LO-CS101-2
             │  │  ├─ Description: "Student will analyze complexity..."
             │  │  ├─ Status badge (for THIS degree):
             │  │  │  ├─ If evaluation saved: ✓ Completed
             │  │  │  └─ If no evaluation: ○ Pending
             │  │  └─ [Edit Evaluation] button
             │  │
             │  └─ Objective 3 (LO3)
             │     ├─ Code: LO-CS101-3
             │     ├─ Description: "Student will design algorithms..."
             │     ├─ Status badge (for THIS degree):
             │     │  ├─ If evaluation saved: ✓ Completed
             │     │  └─ If no evaluation: ○ Pending
             │     └─ [Edit Evaluation] button
             │
             └─ User clicks "Edit Evaluation" on an objective
                │
                ├─> [EDIT EVALUATION FORM] 
                │   │
                │   ├─ Objective Code & Description
                │   ├─ Assessment Method dropdown
                │   │  ├─ Homework
                │   │  ├─ Project
                │   │  ├─ Quiz
                │   │  ├─ Oral Presentation
                │   │  ├─ Report
                │   │  ├─ Mid-term
                │   │  ├─ Final Exam
                │   │  └─ Other (with custom text input)
                │   │
                │   ├─ Grade Distribution:
                │   │  ├─ A: [  0  ]
                │   │  ├─ B: [  5  ]
                │   │  ├─ C: [  15 ]
                │   │  └─ F: [  2  ]
                │   │
                │   ├─ Improvement Suggestions (textarea)
                │   │
                │   └─ Buttons:
                │      ├─ [Save This Evaluation]
                │      └─ [Cancel]
                │
                └─ User clicks [Save This Evaluation]
                   │
                   ├─> DELETE old evaluation (if exists) for:
                   │    (section_id, objective_id, degree_id)
                   │
                   ├─> INSERT new evaluation with:
                   │    ├─ sectionId: selectedSection.id
                   │    ├─ objectiveId: selectedObjective.id
                   │    ├─ degreeId: selectedDegree (KEY CHANGE ✓)
                   │    ├─ assessmentMethod: "Quiz" (or custom)
                   │    ├─ countA: 0, countB: 5, countC: 15, countF: 2
                   │    └─ comments: "..."
                   │
                   ├─> Reload evaluations for this (section, degree)
                   │    via loadExistingEvaluations()
                   │
                   ├─> Update objectiveEvaluations state
                   │    (specific to this degree)
                   │
                   ├─> Return to objectives list
                   │    (now showing updated status)
                   │
                   └─> Status updates:
                        LO1: ✓ Completed (was ○ Pending)


MULTI-DEGREE SCENARIO
═══════════════════════════════════════════════════════════════════

Course: CS101 - Data Structures
Taught in: Bachelor of Science + Master of Science

Timeline:
──────────

Step 1: Select CS101, Section 1
        ↓
        Degree Selection appears with 2 options:
        ┌────────────────────────┐
        │ Bachelor of Science    │
        │ (Undergraduate)        │
        └────────────────────────┘
        ┌────────────────────────┐
        │ Master of Science      │
        │ (Graduate)             │
        └────────────────────────┘

Step 2: Click "Master of Science"
        ↓
        Objectives list for MS degree:
        - LO1: ○ Pending
        - LO2: ○ Pending
        - LO3: ○ Pending

Step 3: Enter evaluations for MS degree
        (e.g., Assessment=Exam, higher expectations)
        ↓
        Database stores:
        evaluations(section=CS101-1, objective=LO1, degree=MS)
                    ↑ Note the degree_id

Step 4: Back to Degree Selection
        ↓
        Click "Bachelor of Science"
        ↓
        Objectives list for BS degree:
        - LO1: ○ Pending (BS doesn't have evaluation yet!)
        - LO2: ○ Pending
        - LO3: ○ Pending

Step 5: Enter evaluations for BS degree
        (e.g., Assessment=Quiz, different expectations)
        ↓
        Database stores:
        evaluations(section=CS101-1, objective=LO1, degree=BS)
                    ↑ Different degree_id, so separate record

DATABASE RESULT:
───────────────
Two completely independent evaluation records exist:

Record 1: CS101-1, LO1, BS
          Assessment: Quiz
          Counts: A=5, B=10, C=3, F=0
          
Record 2: CS101-1, LO1, MS
          Assessment: Exam
          Counts: A=8, B=5, C=1, F=0

Same course, same section, same objective
But DIFFERENT evaluations for DIFFERENT degrees ✓


STATE MANAGEMENT FLOW
═══════════════════════════════════════════════════════════════════

State Variable: objectiveEvaluations
Format: { [objectiveId]: { assessmentMethod, countA, countB, ... } }

Timeline:

1. User selects section
   - selectedSection = {id: 1, courseId: 5, ...}
   - selectedDegree = null (TRIGGERS DEGREE SELECTION)
   - objectiveEvaluations = {} (cleared)

2. User selects degree
   - selectedDegree = 2 (MS)
   - loadExistingEvaluations(section, degree)
     └─> Fetches evaluations WHERE section=1 AND degree=2
         └─> objectiveEvaluations = {
               1: { assessmentMethod: "Exam", countA: 8, ... },
               2: { assessmentMethod: "Exam", countA: 9, ... }
             }

3. User sees objectives with status:
   - LO1: getEvaluationStatusForObjective(1)
          └─> objectiveEvaluations[1] exists ✓ "Completed"
   - LO2: getEvaluationStatusForObjective(2)
          └─> objectiveEvaluations[2] exists ✓ "Completed"
   - LO3: getEvaluationStatusForObjective(3)
          └─> objectiveEvaluations[3] undefined → "Pending"

4. User clicks "Back to Degree Selection"
   - selectedDegree = null
   - objectiveEvaluations = {} (cleared)
   - BACK TO DEGREE SELECTION SCREEN

5. User selects different degree (BS)
   - selectedDegree = 1 (BS)
   - loadExistingEvaluations(section, degree)
     └─> Fetches evaluations WHERE section=1 AND degree=1
         └─> objectiveEvaluations = {} (BS has no evals yet!)

6. User sees objectives with status:
   - LO1: "Pending" (no evaluation for BS yet)
   - LO2: "Pending"
   - LO3: "Pending"

This way, each degree sees ONLY its own evaluations
and doesn't see evaluations from other degrees! ✓
```

## Key Implementation Points

### 1. Degree Selection Screen (NEW)
- Only appears when `selectedDegree === null`
- Shows after section selection
- Grid layout with degree cards
- Each card clickable to select that degree

### 2. Load Evaluations with Degree Filter (UPDATED)
```javascript
// BEFORE: Just filtered by section
// AFTER: Filters by section AND degree
evaluations.filter(e => 
  e.sectionId === section.id && 
  e.degreeId === degree.id  // ← KEY CHANGE
)
```

### 3. Save Evaluation with Degree (UNCHANGED - already worked)
```javascript
payload = {
  sectionId: selectedSection.id,
  objectiveId: selectedObjective.id,
  degreeId: selectedDegree,  // ← Already being sent
  assessmentMethod: ...,
  ...
}
```

### 4. Status Checking Per Degree (AUTOMATIC)
```javascript
// Works automatically because objectiveEvaluations
// is already filtered to current degree
getEvaluationStatusForObjective(objectiveId) {
  if (objectiveEvaluations[objectiveId]) {
    return 'completed';
  }
  return 'pending';
}
```

## Result

✓ Same section can have different evaluations per degree
✓ UI clearly shows which degree is being evaluated
✓ Easy to switch between degrees and enter independent data
✓ Progress tracking per degree
✓ Database stores everything correctly with degree_id
