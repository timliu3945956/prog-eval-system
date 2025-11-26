# Degree-Specific Evaluations: Visual Reference Card

## 📊 Before vs After

### BEFORE
```
┌─ Sections List
│   ├─ [Select Section A]
│   ├─ [Select Section B]
│   └─ [Select Section C]
│
└─ Click Section A
   └─ Objectives List (for Section A)
      ├─ Objective 1: [Edit]
      ├─ Objective 2: [Edit]
      └─ Objective 3: [Edit]
```
**Problem**: No degree selection. What if section is taught in BS and MS?

---

### AFTER
```
┌─ Sections List
│   ├─ [Select Section A]
│   ├─ [Select Section B]
│   └─ [Select Section C]
│
└─ Click Section A
   └─ ✨ DEGREE SELECTION (NEW) ✨
      ├─ [Bachelor of Science] ← Click one
      ├─ [Master of Science]
      └─ [PhD Program]
         │
         └─ Objectives List (for Section A + BS)
            ├─ Objective 1: ✓ Complete [Edit]
            ├─ Objective 2: ○ Pending [Add]
            └─ Objective 3: ○ Pending [Add]
```
**Solution**: Choose degree, then enter degree-specific evaluations

---

## 🎯 State Diagram

```
┌─────────────────┐
│ selectedDegree  │
│     = null      │
└────────┬────────┘
         │
         ↓ User selects section
┌──────────────────────────┐
│ Show DEGREE SELECTION    │
│  (if multi-degree)       │
└────────┬─────────────────┘
         │
         ↓ User clicks degree card
      ┌──────────────────────────────────┐
      │ Load evaluations for this degree │
      │ (filter by degree_id)            │
      │ Set selectedDegree = degree.id   │
      └────────┬─────────────────────────┘
               │
               ↓
       ┌──────────────────────┐
       │ Show OBJECTIVES LIST │
       │ (for this degree)    │
       └────────┬─────────────┘
                │
                ├─ User clicks objective
                │  └─ Show EDIT FORM
                │     └─ Save with degree_id ✓
                │
                └─ User clicks "Back"
                   └─ selectedDegree = null
                      └─ Show DEGREE SELECTION again
```

---

## 📱 UI Screenshots (Text Representation)

### Screen 1: Degree Selection
```
═════════════════════════════════════════════════════════════
                 EVALUATION MANAGER
                                    ← Back to Sections
  CS101 - Data Structures - Section 1
  Semester: Fall 2024 | Instructor: Dr. Johnson

  ┌─────────────────────────────────────────────────────────┐
  │  Select a Degree to Enter Evaluations                  │
  │                                                         │
  │  This course is taught for multiple degree programs.   │
  │  Select which degree's evaluations you'd like to enter:│
  │                                                         │
  │  ┌─────────────────────┐  ┌─────────────────────┐    │
  │  │ Bachelor of Science │  │  Master of Science  │    │
  │  │   Undergraduate     │  │     Graduate        │    │
  │  └─────────────────────┘  └─────────────────────┘    │
  │                                                         │
  │  (Hover effect: Blue border, shadow, lift)            │
  └─────────────────────────────────────────────────────────┘
═════════════════════════════════════════════════════════════
```

### Screen 2: Objectives for Selected Degree
```
═════════════════════════════════════════════════════════════
  ← Back to Degree Selection
  
  Evaluating for: Master of Science
  
  Learning Objectives to Evaluate
  
  ┌─────────────────────────────────────────────────────────┐
  │ LO-CS101-1: Student will implement sorting algorithms  │
  │ Status: ○ Pending                      [Add Evaluation] │
  └─────────────────────────────────────────────────────────┘
  
  ┌─────────────────────────────────────────────────────────┐
  │ LO-CS101-2: Student will analyze computational ...     │
  │ Status: ✓ Completed                   [Edit Evaluation]│
  └─────────────────────────────────────────────────────────┘
  
  ┌─────────────────────────────────────────────────────────┐
  │ LO-CS101-3: Student will design complex algorithms    │
  │ Status: ○ Pending                      [Add Evaluation] │
  └─────────────────────────────────────────────────────────┘

  [Back to Sections]
═════════════════════════════════════════════════════════════
```

### Screen 3: Edit Evaluation Form (for selected degree)
```
═════════════════════════════════════════════════════════════
  ← Back to Objectives
  
  LO-CS101-1: Student will implement sorting algorithms
  
  What is used to evaluate this objective? *
  [Exam ▼]
  
  Grade Distribution *
  A: [8]   B: [5]   C: [2]   F: [0]
  
  Improvement Suggestions (Optional)
  [Great understanding overall. Some students struggled...]
  
  [Save This Evaluation] [Cancel]
═════════════════════════════════════════════════════════════
```

---

## 🔄 Data Flow Example

### Same Objective, Different Degrees, Different Data

```
DATABASE BEFORE (CS101-Section1, Objective-LO1)
────────────────────────────────────────────
[No evaluation yet]

USER ACTION: Select CS101-1 (Section 1)
   ↓
SHOW: Degree selection screen

USER ACTION: Select BS degree
   ↓
LOAD: evaluations WHERE section_id=1 AND objective_id=1 AND degree_id=BS
RESULT: objectiveEvaluations = {} (empty, hasn't been entered yet)

USER ACTION: Enter BS evaluation
   Assessment: Quiz
   Counts: A:5, B:10, C:3, F:0
   ↓
SAVE: INSERT INTO evaluations 
      (section_id=1, objective_id=1, degree_id=BS, assessment_method='Quiz', ...)

DATABASE NOW
────────────────────────────────────────────
Row 1: section=1, objective=1, degree=BS, method=Quiz, A=5, B=10, C=3, F=0

USER ACTION: Back to Degree Selection
USER ACTION: Select MS degree
   ↓
LOAD: evaluations WHERE section_id=1 AND objective_id=1 AND degree_id=MS
RESULT: objectiveEvaluations = {} (empty, MS hasn't been evaluated yet)

USER ACTION: Enter MS evaluation (different from BS)
   Assessment: Final Exam
   Counts: A:8, B:5, C:1, F:0
   ↓
SAVE: INSERT INTO evaluations 
      (section_id=1, objective_id=1, degree_id=MS, assessment_method='Final Exam', ...)

DATABASE NOW (FINAL STATE)
────────────────────────────────────────────
Row 1: section=1, objective=1, degree=BS,  method=Quiz,      A=5, B=10, C=3, F=0
Row 2: section=1, objective=1, degree=MS,  method=FinalExam, A=8, B=5,  C=1, F=0

✓ SAME section and objective
✓ DIFFERENT degrees
✓ DIFFERENT assessments (Quiz vs Final Exam)
✓ DIFFERENT grade distributions
```

---

## 🔍 Key Implementation Points

### 1. Degree Selection Happens After Section
```javascript
if (!selectedSection) {
  // Show sections list
} else if (!selectedDegree) {
  // ← NEW STEP: Show degree selection
  // Get degrees for this section's course
  getDegreesForSection(selectedSection.courseId)
} else if (!selectedObjective) {
  // Show objectives list
} else {
  // Show edit form
}
```

### 2. Evaluations Loaded Per Degree
```javascript
// BEFORE: evaluations.filter(e => e.sectionId === section.id)
// AFTER:
evaluations.filter(e => 
  e.sectionId === section.id && 
  e.degreeId === degree.id  // ← KEY CHANGE
)
```

### 3. Status Checked Per Degree
```javascript
// Status automatically reflects current degree
// because objectiveEvaluations is degree-specific
getEvaluationStatusForObjective(objectiveId) {
  if (objectiveEvaluations[objectiveId]) {
    return 'completed';  // For THIS degree
  }
  return 'pending';  // For THIS degree
}
```

### 4. Save Includes Degree
```javascript
payload = {
  sectionId: selectedSection.id,
  objectiveId: selectedObjective.id,
  degreeId: selectedDegree,  // ← Already being sent!
  assessmentMethod: "Exam",
  countA: 8,
  ...
}
```

---

## ✨ Visual Feature Highlights

### Degree Card Interaction
```
Normal State:
┌─────────────────────┐
│ Bachelor of Science │
│   Undergraduate     │
└─────────────────────┘

Hover State (Mouse Over):
┌─────────────────────┐ ← Blue border
│ Bachelor of Science │   Blue shadow
│   Undergraduate     │   Lifted up
└─────────────────────┘

Active State (Clicked):
┌─────────────────────┐
│ Bachelor of Science │ ← Light blue background
│   Undergraduate     │
└─────────────────────┘
```

### Degree Header Banner
```
┌─────────────────────────────────────────┐
│█ Evaluating for: Master of Science      │ ← Blue left border
│                                         │ Light blue background
└─────────────────────────────────────────┘
```

### Status Indicators
```
○ Pending  = Gray circle, not yet evaluated
✓ Completed = Green checkmark, evaluation saved
```

---

## 📈 Progress Tracking

### Progress Per Degree

**Scenario**: Section with 3 objectives, 2 degrees

```
BACHELOR OF SCIENCE
Objective 1: ✓ (saved)
Objective 2: ✓ (saved)
Objective 3: ○ (pending)
Progress: 66% (2 of 3 completed)

MASTER OF SCIENCE
Objective 1: ○ (pending)
Objective 2: ✓ (saved)
Objective 3: ○ (pending)
Progress: 33% (1 of 3 completed)

When viewing BS: Progress bar shows 66%
When viewing MS: Progress bar shows 33%
```

---

## 🎨 Color Scheme

| Color | Usage | RGB |
|-------|-------|-----|
| #0066cc | Primary (buttons, borders on hover) | Blue |
| #dc3545 | Danger (errors) | Red |
| #e0e0e0 | Secondary (borders, light dividers) | Gray |
| #f9f9f9 | Background (containers) | Light Gray |
| #e3f2fd | Degree Header BG | Very Light Blue |
| #2196F3 | Degree Header Border | Bright Blue |
| #1976D2 | Degree Header Text | Dark Blue |

---

## 🚀 Performance Indicators

| Metric | Status | Notes |
|--------|--------|-------|
| Initial Load | ✅ Fast | No additional API calls on load |
| Degree Selection | ✅ Instant | Uses existing data in memory |
| Objectives Load | ✅ Fast | Filters existing data |
| Save Operation | ✅ Fast | Single API call per evaluation |
| UI Responsiveness | ✅ Smooth | Instant state updates |
| Mobile Performance | ✅ Good | Grid responsive to all sizes |

---

## 📋 Quick Decision Tree

```
Does the system need to support multiple degrees per section?
   ├─ YES
   │  └─ Use degree selection screen
   │     ├─ Gets called automatically
   │     ├─ Shows all applicable degrees
   │     └─ Each selection loads that degree's data
   │
   └─ NO (Future: remove degree selection)
      └─ Skip directly to objectives
         ├─ Same as single-degree scenario
         └─ Works for backward compatibility
```

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Degree selection doesn't appear | Single degree course | Normal - no degree selection needed |
| Status shows pending but I saved | Different degree | You saved for different degree, check current degree |
| Data disappeared | Navigated away | Data persists in database, reload to verify |
| Can't see back button | Mobile view | Scroll up if needed, button at top |
| Same values appearing for both degrees | Bug | Check if loadExistingEvaluations filters by degree_id |

---

## 📚 Related Documentation

- **QUICK_REFERENCE.md** - User-friendly overview
- **CODE_CHANGES_SUMMARY.md** - Exact code changes
- **WORKFLOW_DIAGRAM.md** - Detailed state flows
- **DEGREE_SPECIFIC_EVALUATIONS.md** - Technical deep dive
- **CHECKLIST.md** - Verification checklist

---

## ✅ Implementation Status

**Feature Status**: ✅ **COMPLETE**
- All code implemented
- All CSS styled  
- All state management working
- No errors or warnings
- Ready for testing

**Deployment Status**: ✅ **READY**
- Backward compatible
- No breaking changes
- No database migrations needed
- No API changes needed
