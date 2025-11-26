# Degree-Specific Evaluations Implementation

## Overview
Implemented support for separate evaluations for the same section and objective across different degree programs. The system now allows professors to enter different evaluation results for the same course objective when that course is taught in multiple degree programs (e.g., BS vs MS).

## Architecture Changes

### Database Layer ✓
- **Already supported**: The `evaluations` table already has a composite key of `(section_id, objective_id, degree_id)`
- No database schema changes were needed
- Backend already stores `degree_id` with each evaluation record

### UI Workflow - New Flow ✓

The evaluation entry process now has an additional step:

```
1. Filter Sections (optional: degree, semester, year, instructor)
   ↓
2. Select Section
   ↓
3. **NEW: Select Degree** (shows all degrees for that course)
   ↓
4. View Learning Objectives (for selected degree)
   ↓
5. Enter/Edit Evaluation (section + degree + objective specific)
   ↓
6. Save (stores with correct degree_id)
```

### Frontend Components

#### 1. Degree Selection Screen
- **When triggered**: After user selects a section, before objectives list appears
- **What it shows**: Grid of all degree programs that teach the selected course
- **Layout**: Responsive grid with degree cards showing:
  - Degree name (e.g., "Bachelor of Science")
  - Degree level (e.g., "Undergraduate")
- **Interaction**: Click degree card to proceed to objectives for that degree

#### 2. Degree Header
- **Shows**: "Evaluating for: [Degree Name]" banner
- **Location**: Above objectives list when degree is selected
- **Back button**: "← Back to Degree Selection" to change degree

#### 3. Objectives List
- **Behavior**: Shows objectives filtered for the selected section and degree
- **Status**: Reflects completion status specific to (section, degree, objective) combination
- **Edit behavior**: Same objective may show different status for different degrees

## Code Changes

### EvaluationManager.jsx

#### New/Updated Functions:

1. **`getDegreesForSection(courseId)`** ✓
   - Maps course to all degrees via `degreeMappings`
   - Returns array of degree objects that teach this course
   ```javascript
   const degreeIds = degreeMappings
     .filter(m => m.courseId === courseId)
     .map(m => m.degreeId);
   return degrees.filter(d => degreeIds.includes(d.id));
   ```

2. **`handleSelectSection(section)`** - Updated ✓
   - Now sets `selectedDegree` to `null` instead of pre-selecting
   - Clears objectives evaluations to trigger degree selection screen
   - Resets all form state

3. **`loadExistingEvaluations(section, degree)`** - Updated ✓
   - Now filters evaluations by: `sectionId === section.id && degreeId === degree.id`
   - Loads only evaluations for that specific degree
   - Called when degree is selected in UI

#### State Management:
- `selectedDegree`: Stores currently selected degree ID (null = show degree selection)
- `objectiveEvaluations`: Contains evaluations specific to current (section, degree) combo
- When switching degrees: State is cleared and reloaded with new degree's data

#### Conditional Rendering:
```javascript
{!selectedDegree ? (
  // DEGREE SELECTION SCREEN
  <div className="degree-selection-container">
    {getDegreesForSection(courseId).map(degree => (
      <button onClick={() => {
        setSelectedDegree(degree.id);
        loadExistingEvaluations(selectedSection, degree);
      }}>
        {degree.name} ({degree.level})
      </button>
    ))}
  </div>
) : (
  // OBJECTIVES SCREEN (current logic unchanged)
  <>
    <div className="degree-header">...</div>
    {/* objectives list */}
  </>
)}
```

### EvaluationManager.css - New Styles

#### Degree Selection Container
- `.degree-selection-container`: Light background form with padding
- `.degrees-grid`: CSS grid layout (auto-fit, minmax 220px)
- `.degree-card`: Button-style cards with hover effects
  - Hover: Blue border, shadow, slight lift animation
  - Active: Light blue background
- `.degree-name`: Bold, larger font for degree name
- `.degree-level`: Smaller gray text for degree level (e.g., "Undergraduate")

#### Degree Header
- `.degree-header`: Blue banner showing current degree
- Location: Above objectives list
- Shows: "Evaluating for: [Degree Name]"

## Data Flow Example

### Scenario: Same section taught in BS and MS

**Database State:**
```
evaluations table:
- (section=CS101, objective=LO1, degree=1_BS): Assessment=Quiz, counts...
- (section=CS101, objective=LO1, degree=2_MS): Assessment=Exam, counts...
```

**UI Workflow:**
1. Filter sections → Select "CS101 - Section 1" (taught in both BS and MS)
2. Degree selection shows:
   - [Bachelor of Science]
   - [Master of Science]
3. Click "Master of Science"
4. Objectives list shows:
   - LO1: If MS evaluation was never saved → "Pending"
   - LO1: If MS evaluation was saved → "Completed" with Edit button
5. Click "Edit Evaluation" on LO1 → Shows MS's values (e.g., Exam)
6. Edit and save → Updates database with degree_id=2 (MS)
7. Back to degree selection
8. Click "Bachelor of Science"
9. Objectives list now shows:
   - LO1: "Completed" (BS has different evaluation saved)
10. Click "Edit Evaluation" → Shows BS's values (e.g., Quiz)

## Status Tracking Per Degree

- `getEvaluationStatusForObjective(objectiveId)`
  - Checks `objectiveEvaluations[objectiveId]`
  - Since `objectiveEvaluations` is loaded per-degree via `loadExistingEvaluations()`
  - Status reflects: "pending" or "completed" for that specific degree

- Progress bar calculation:
  - Counts completed evaluations for (section, degree) combination
  - Pending = Total objectives - Completed for that degree

## Testing Checklist

- [ ] Select section taught in multiple degrees → Degree selection appears
- [ ] Degree cards display all degrees for that course
- [ ] Click degree card → Loads that degree's objectives and evaluations
- [ ] Same objective shows different status/values in different degrees
- [ ] Edit objective in one degree → Doesn't affect other degrees
- [ ] Save evaluation → Database stores with correct degree_id
- [ ] Progress bar updates per degree
- [ ] Back button returns to degree selection
- [ ] Switching degrees updates objectives list with correct data

## Backward Compatibility

- ✓ Courses taught in only ONE degree still work
- ✓ Degree selection screen appears for all sections (shows single degree option)
- ✓ All previous features maintained: auto-save, custom methods, validation
- ✓ API endpoints unchanged
- ✓ Database schema unchanged

## Files Modified

1. **EvaluationManager.jsx**
   - Added `getDegreesForSection()` function
   - Updated `handleSelectSection()` to show degree selection
   - Updated `loadExistingEvaluations()` to filter by degree
   - Added conditional rendering for degree selection screen
   - Added back button to return from objectives to degree selection

2. **EvaluationManager.css**
   - Added `.degree-selection-container` styles
   - Added `.degrees-grid` layout
   - Added `.degree-card` button styles with hover/active states
   - Added `.degree-name` and `.degree-level` typography
   - Added `.degree-header` banner styles

## Notes

- The implementation leverages existing `degreeMappings` table to determine which degrees teach which courses
- No API changes needed - backend already supports this architecture
- The UI now clearly shows users they're entering evaluations for a specific degree
- Same course can have completely different evaluation results across degree programs
