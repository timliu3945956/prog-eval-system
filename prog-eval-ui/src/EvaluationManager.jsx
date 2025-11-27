import React, { useState, useEffect } from 'react';
import './EvaluationManager.css';

const STANDARD_METHODS = ['Homework', 'Project', 'Quiz', 'Oral Presentation', 'Report', 'Mid-term', 'Final Exam'];

function EvaluationManager() {
  const [evaluations, setEvaluations] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [sections, setSections] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [degreeMappings, setDegreeMappings] = useState([]);
  const [courseMappings, setCourseMappings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedObjective, setSelectedObjective] = useState(null);
  
  const [formData, setFormData] = useState({
    degreeId: '',
    semester: '',
    year: '',
    instructorId: ''
  });
  
  // Store evaluation data for each objective: { objectiveId: { assessmentMethod, countA, countB, countC, countF, comments } }
  const [objectiveEvaluations, setObjectiveEvaluations] = useState({});
  const [filteredSections, setFilteredSections] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentObjectiveData, setCurrentObjectiveData] = useState({
    assessmentMethod: '',
    customAssessment: '',
    countA: '',
    countB: '',
    countC: '',
    countF: '',
    comments: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [evaluationsRes, degreesRes, instructorsRes, sectionsRes, objectivesRes, mappingsRes, courseMappingsRes, coursesRes] = await Promise.all([
        fetch('http://localhost:8080/api/evaluations'),
        fetch('http://localhost:8080/api/degrees'),
        fetch('http://localhost:8080/api/instructors'),
        fetch('http://localhost:8080/api/sections'),
        fetch('http://localhost:8080/api/objectives'),
        fetch('http://localhost:8080/api/degree-course-mappings'),
        fetch('http://localhost:8080/api/course-objective-mappings'),
        fetch('http://localhost:8080/api/courses')
      ]);

      if (!evaluationsRes.ok || !degreesRes.ok || !instructorsRes.ok || !sectionsRes.ok || !objectivesRes.ok || !mappingsRes.ok || !courseMappingsRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const evaluationsData = await evaluationsRes.json();
      const degreesData = await degreesRes.json();
      const instructorsData = await instructorsRes.json();
      const sectionsData = await sectionsRes.json();
      const objectivesData = await objectivesRes.json();
      const mappingsData = await mappingsRes.json();
      const courseMappingsData = await courseMappingsRes.json();
      const coursesData = await coursesRes.json();

      setEvaluations(evaluationsData);
      setDegrees(degreesData);
      setInstructors(instructorsData);
      setSections(sectionsData);
      setObjectives(objectivesData);
      setDegreeMappings(mappingsData);
      setCourseMappings(courseMappingsData);
      setCourses(coursesData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err.message);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Filter sections based on degree, semester, year and instructor
    if (name === 'degreeId' || name === 'semester' || name === 'year' || name === 'instructorId') {
      const newFormData = { ...formData, [name]: value };
      filterSections(newFormData);
    }
  };

  const handleObjectiveChange = (objectiveId, field, value) => {
    setObjectiveEvaluations(prev => ({
      ...prev,
      [objectiveId]: {
        ...prev[objectiveId],
        [field]: value
      }
    }));
    // Clear validation error for this field
    if (validationErrors[`obj_${objectiveId}_${field}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`obj_${objectiveId}_${field}`]: ''
      }));
    }
  };

  const filterSections = (data) => {
    let filtered = sections;

    // Get courses for the selected degree
    if (data.degreeId) {
      const coursesForDegree = getCoursesForDegree(parseInt(data.degreeId));
      const courseIds = coursesForDegree.map(c => c.id);
      filtered = filtered.filter(s => courseIds.includes(s.courseId));
    }

    if (data.semester) {
      // Parse semester and year from combined format or match by semester
      filtered = filtered.filter(s => s.semester.startsWith(data.semester));
    }

    if (data.year) {
      filtered = filtered.filter(s => s.semester.includes(data.year));
    }

    if (data.instructorId) {
      filtered = filtered.filter(s => s.instructorId === parseInt(data.instructorId));
    }

    setFilteredSections(filtered);
  };

  const getEvaluationStats = (sectionId) => {
    const sectionEvals = evaluations.filter(e => e.sectionId === sectionId);
    const total = objectives.length;
    const completed = sectionEvals.length;
    const pending = total - completed;
    return { completed, pending, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getEvaluationStatsForDegree = (sectionId, degreeId) => {
    const courseObjectives = getObjectivesForCourse(
      sections.find(s => s.id === sectionId)?.courseId
    );
    const total = courseObjectives.length;
    const completed = evaluations.filter(
      e => e.sectionId === sectionId && e.degreeId === degreeId
    ).length;
    const pending = total - completed;
    return { completed, pending, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getCoursesForDegree = (degreeId) => {
    const courseIds = degreeMappings
      .filter(m => m.degreeId === parseInt(degreeId))
      .map(m => m.courseId);
    return courses.filter(c => courseIds.includes(c.id));
  };

  const getDegreesForSection = (courseId) => {
    // Get all degrees that have this course mapped to them
    const degreeIds = degreeMappings
      .filter(m => m.courseId === courseId)
      .map(m => m.degreeId);
    return degrees.filter(d => degreeIds.includes(d.id));
  };

  const getObjectivesForCourse = (courseId) => {
    // Get objectives that are mapped to this course using course-objective mappings
    const courseObjectiveMappings = courseMappings.filter(m => m.courseId === courseId);
    const objectiveIds = courseObjectiveMappings.map(m => m.objectiveId);
    return objectives.filter(o => objectiveIds.includes(o.id));
  };

  const loadExistingEvaluations = (section, degree) => {
    const sectionEvaluations = evaluations.filter(
      e => e.sectionId === section.id && e.degreeId === degree.id
    );
    
    const newObjectiveEvaluations = {};
    sectionEvaluations.forEach(evaluation => {
      // Determine if the assessment method is standard or custom
      const isStandardMethod = STANDARD_METHODS.includes(evaluation.assessmentMethod);
      
      newObjectiveEvaluations[evaluation.objectiveId] = {
        // Store 'Other' in assessmentMethod if it's custom, otherwise store the standard method
        assessmentMethod: isStandardMethod ? evaluation.assessmentMethod : 'Other',
        // Store the actual custom text (or empty if standard)
        customAssessment: isStandardMethod ? '' : evaluation.assessmentMethod,
        countA: evaluation.countA || 0,
        countB: evaluation.countB || 0,
        countC: evaluation.countC || 0,
        countF: evaluation.countF || 0,
        comments: evaluation.comments || ''
      };
    });
    setObjectiveEvaluations(newObjectiveEvaluations);
  };

  const handleSelectSection = (section) => {
    setSelectedSection(section);
    setSelectedDegree(null);
    setSelectedObjective(null);
    setObjectiveEvaluations({});
    setValidationErrors({});
  };

  const handleSelectObjective = (objective) => {
    const evalData = objectiveEvaluations[objective.id] || {};
    
    setCurrentObjectiveData({
      assessmentMethod: evalData.assessmentMethod || '',
      customAssessment: evalData.customAssessment || '',
      countA: evalData.countA || '',
      countB: evalData.countB || '',
      countC: evalData.countC || '',
      countF: evalData.countF || '',
      comments: evalData.comments || ''
    });
    setSelectedObjective(objective);
    setValidationErrors({});
  };

  const handleObjectiveDataChange = (field, value) => {
    setCurrentObjectiveData(prev => ({
      ...prev,
      [field]: value
    }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSaveObjective = async () => {
    // Validate current objective
    const errors = {};
    
    if (!currentObjectiveData.assessmentMethod) {
      errors.assessmentMethod = 'Assessment method is required';
    }

    // If "Other" is selected, validate that custom method is provided
    if (currentObjectiveData.assessmentMethod === 'Other' && !currentObjectiveData.customAssessment) {
      errors.assessmentMethod = 'Please specify the custom assessment method';
    }

    const countA = parseInt(currentObjectiveData.countA) || 0;
    const countB = parseInt(currentObjectiveData.countB) || 0;
    const countC = parseInt(currentObjectiveData.countC) || 0;
    const countF = parseInt(currentObjectiveData.countF) || 0;

    if (countA < 0 || countB < 0 || countC < 0 || countF < 0) {
      errors.counts = 'Counts cannot be negative';
    }

    if (countA === 0 && countB === 0 && countC === 0 && countF === 0) {
      errors.counts = 'At least one count must be entered';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // First delete any existing evaluation for this section/objective/degree
      const existingEval = evaluations.find(
        e => e.sectionId === selectedSection.id && 
             e.objectiveId === selectedObjective.id && 
             e.degreeId === selectedDegree
      );

      if (existingEval) {
        await fetch(`http://localhost:8080/api/evaluations/${existingEval.id}`, {
          method: 'DELETE'
        });
      }

      // Determine the assessment method to save
      const assessmentMethodToSave = currentObjectiveData.assessmentMethod === 'Other' 
        ? currentObjectiveData.customAssessment 
        : currentObjectiveData.assessmentMethod;

      // Create new evaluation
      const payload = {
        sectionId: selectedSection.id,
        objectiveId: selectedObjective.id,
        degreeId: selectedDegree,
        assessmentMethod: assessmentMethodToSave,
        countA: parseInt(currentObjectiveData.countA) || 0,
        countB: parseInt(currentObjectiveData.countB) || 0,
        countC: parseInt(currentObjectiveData.countC) || 0,
        countF: parseInt(currentObjectiveData.countF) || 0,
        comments: currentObjectiveData.comments || ''
      };

      const response = await fetch('http://localhost:8080/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to save evaluation`);
      }

      // Update local state - properly store standard vs custom methods
      const isStandardMethod = STANDARD_METHODS.includes(assessmentMethodToSave);
      
      setObjectiveEvaluations(prev => ({
        ...prev,
        [selectedObjective.id]: {
          assessmentMethod: isStandardMethod ? assessmentMethodToSave : 'Other',
          customAssessment: isStandardMethod ? '' : assessmentMethodToSave,
          countA: parseInt(currentObjectiveData.countA) || 0,
          countB: parseInt(currentObjectiveData.countB) || 0,
          countC: parseInt(currentObjectiveData.countC) || 0,
          countF: parseInt(currentObjectiveData.countF) || 0,
          comments: currentObjectiveData.comments || ''
        }
      }));

      setError(null);
      setSelectedObjective(null);
      setCurrentObjectiveData({
        assessmentMethod: '',
        customAssessment: '',
        countA: '',
        countB: '',
        countC: '',
        countF: '',
        comments: ''
      });
      fetchAllData();
    } catch (err) {
      console.error('Failed to save evaluation:', err.message);
      setError('Failed to save evaluation: ' + err.message);
    }
  };

  const validateObjectives = () => {
    const errors = {};
    const courseObjectives = getObjectivesForCourse(selectedSection.courseId);

    courseObjectives.forEach(obj => {
      const evalData = objectiveEvaluations[obj.id] || {};
      
      if (!evalData.assessmentMethod) {
        errors[`obj_${obj.id}_assessmentMethod`] = 'Assessment method is required';
      }

      const countA = parseInt(evalData.countA) || 0;
      const countB = parseInt(evalData.countB) || 0;
      const countC = parseInt(evalData.countC) || 0;
      const countF = parseInt(evalData.countF) || 0;

      if (countA < 0 || countB < 0 || countC < 0 || countF < 0) {
        errors[`obj_${obj.id}_counts`] = 'Counts cannot be negative';
      }

      if (countA === 0 && countB === 0 && countC === 0 && countF === 0) {
        errors[`obj_${obj.id}_counts`] = 'At least one count must be entered';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getEvaluationStatusForObjective = (objectiveId) => {
    const evalData = objectiveEvaluations[objectiveId];
    if (!evalData || !evalData.assessmentMethod) {
      return 'pending';
    }
    return 'completed';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSaveObjective();
  };

  const handleCancel = () => {
    setFormData({ degreeId: '', semester: '', instructorId: '', sectionId: '' });
    setObjectiveEvaluations({});
    setValidationErrors({});
    setFilteredSections([]);
    setSelectedSection(null);
    setSelectedDegree(null);
    setSelectedObjective(null);
    setCurrentObjectiveData({
      assessmentMethod: '',
      customAssessment: '',
      countA: '',
      countB: '',
      countC: '',
      countF: '',
      comments: ''
    });
  };

  const getCoursesForSection = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return [];
    return degreeMappings.filter(m => 
      sections.some(s => s.courseId === m.courseId && s.courseId === section.courseId)
    ).map(m => m.degreeId);
  };

  const getSemesters = () => {
    const uniqueSemesters = new Set();
    
    // Get courses for the selected degree (if any)
    let courseIds = [];
    if (formData.degreeId) {
      const coursesForDegree = getCoursesForDegree(parseInt(formData.degreeId));
      courseIds = coursesForDegree.map(c => c.id);
    }
    
    // Get all semester/year combinations
    sections.forEach(s => {
      // If degree is selected, only include sections from that degree's courses
      if (formData.degreeId && !courseIds.includes(s.courseId)) {
        return;
      }
      const semesterPart = s.semester.split(' ')[0]; // e.g., "Fall" from "Fall 2024"
      uniqueSemesters.add(semesterPart);
    });
    return Array.from(uniqueSemesters).sort();
  };

  const getYears = () => {
    const uniqueYears = new Set();
    
    // Get courses for the selected degree (if any)
    let courseIds = [];
    if (formData.degreeId) {
      const coursesForDegree = getCoursesForDegree(parseInt(formData.degreeId));
      courseIds = coursesForDegree.map(c => c.id);
    }
    
    // Get all years
    sections.forEach(s => {
      // If degree is selected, only include sections from that degree's courses
      if (formData.degreeId && !courseIds.includes(s.courseId)) {
        return;
      }
      const yearPart = s.semester.split(' ')[1]; // e.g., "2024" from "Fall 2024"
      if (yearPart) {
        uniqueYears.add(yearPart);
      }
    });
    return Array.from(uniqueYears).sort().reverse();
  };

  const getInstructorsBySemesterAndDegree = () => {
    const uniqueInstructors = new Set();
    
    // Get courses for the selected degree (if any)
    let courseIds = [];
    if (formData.degreeId) {
      const coursesForDegree = getCoursesForDegree(parseInt(formData.degreeId));
      courseIds = coursesForDegree.map(c => c.id);
    }
    
    // Get instructors based on all selected filters
    sections.forEach(s => {
      let matches = true;
      
      // If degree is selected, only include sections from that degree's courses
      if (formData.degreeId && !courseIds.includes(s.courseId)) {
        matches = false;
      }
      
      if (formData.semester && !s.semester.startsWith(formData.semester)) {
        matches = false;
      }
      
      if (formData.year && !s.semester.includes(formData.year)) {
        matches = false;
      }
      
      if (matches) {
        uniqueInstructors.add(s.instructorId);
      }
    });
    return Array.from(uniqueInstructors).map(id => 
      instructors.find(i => i.id === id)
    ).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  };

  const getDegreeName = (degreeId) => {
    const degree = degrees.find(d => d.id === degreeId);
    return degree ? degree.name : `Degree ${degreeId}`;
  };

  const getInstructorName = (instructorId) => {
    const instructor = instructors.find(i => i.id === instructorId);
    return instructor ? instructor.name : `Instructor ${instructorId}`;
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.courseNumber} - ${course.title}` : `Course ${courseId}`;
  };

  const getObjectiveName = (objectiveId) => {
    const objective = objectives.find(o => o.id === objectiveId);
    return objective ? objective.description : `Objective ${objectiveId}`;
  };

  if (loading) return <div className="evaluation-manager"><p>Loading evaluations...</p></div>;

  return (
    <div className="evaluation-manager">
      <div className="evaluation-header">
        <h2>Enter Program Evaluations</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!selectedSection ? (
        <>
          <div className="evaluation-form">
            <h3>Filter Sections</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Degree</label>
                <select
                  name="degreeId"
                  value={formData.degreeId}
                  onChange={handleInputChange}
                >
                  <option value="">All Degrees</option>
                  {degrees.map(degree => (
                    <option key={degree.id} value={degree.id}>
                      {degree.name} ({degree.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                >
                  <option value="">All Semesters</option>
                  {getSemesters().map(sem => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                >
                  <option value="">All Years</option>
                  {getYears().map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Instructor</label>
                <select
                  name="instructorId"
                  value={formData.instructorId}
                  onChange={handleInputChange}
                >
                  <option value="">All Instructors</option>
                  {getInstructorsBySemesterAndDegree().map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredSections.length > 0 ? (
            <div className="sections-list">
              <h3>Available Sections</h3>
              <div className="sections-grid">
                {filteredSections.map(section => {
                  return (
                    <div key={section.id} className="section-card">
                      <div className="section-title">
                        {section.courseNumber} - Section {section.sectionNumber}
                      </div>
                      <div className="section-details">
                        <p><strong>Semester:</strong> {section.semester}</p>
                        <p><strong>Instructor:</strong> {getInstructorName(section.instructorId)}</p>
                        <p><strong>Enrollment:</strong> {section.enrollment || 'N/A'}</p>
                      </div>
                      <div className="section-actions">
                        <button 
                          className="btn-enter-data" 
                          onClick={() => handleSelectSection(section)}
                        >
                          Add/Edit Evaluation
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="no-data">No sections found matching your search criteria. Try adjusting your filters.</p>
          )}
        </>
      ) : !selectedDegree ? (
        <>
          <button 
            type="button" 
            className="btn-back"
            onClick={() => {
              setSelectedSection(null);
              setObjectiveEvaluations({});
              setValidationErrors({});
              setCurrentObjectiveData({
                assessmentMethod: '',
                customAssessment: '',
                countA: '',
                countB: '',
                countC: '',
                countF: '',
                comments: ''
              });
            }}
          >
            ← Back to Sections
          </button>

          <div className="section-info">
            <h4>{getCourseName(selectedSection.courseId)} - Section {selectedSection.sectionNumber}</h4>
            <p><strong>Semester:</strong> {selectedSection.semester}</p>
            <p><strong>Instructor:</strong> {getInstructorName(selectedSection.instructorId)}</p>
          </div>

          <div className="degree-selection-container">
            <h3>Select a Degree to Enter Evaluations</h3>
            <p className="degree-selection-info">This course is taught for multiple degree programs. Select which degree's evaluations you'd like to enter:</p>
            <div className="degree-cards-grid">
              {getDegreesForSection(selectedSection.courseId).map(degree => {
                const stats = getEvaluationStatsForDegree(selectedSection.id, degree.id);
                return (
                  <div key={degree.id} className="degree-eval-card">
                    <div className="degree-card-header">
                      <h4>{degree.name}</h4>
                      <p className="degree-level">{degree.level}</p>
                    </div>
                    <div className="degree-progress-section">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${stats.percentage}%` }}
                        >
                          {stats.percentage > 0 && `${stats.percentage}%`}
                        </div>
                      </div>
                      <div className="progress-text">
                        {stats.completed} of {stats.total} evaluations completed
                      </div>
                    </div>
                    <button
                      className="btn-enter-degree"
                      onClick={() => {
                        setSelectedDegree(degree.id);
                        loadExistingEvaluations(selectedSection, degree);
                      }}
                    >
                      Enter Evaluations
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : !selectedObjective ? (
        <>
          <button 
            type="button" 
            className="btn-back"
            onClick={() => {
              setSelectedDegree(null);
              setSelectedObjective(null);
              setObjectiveEvaluations({});
              setValidationErrors({});
              setCurrentObjectiveData({
                assessmentMethod: '',
                customAssessment: '',
                countA: '',
                countB: '',
                countC: '',
                countF: '',
                comments: ''
              });
            }}
          >
            ← Back to Degree Selection
          </button>

          <div className="degree-header">
            <h3>Evaluating for: <strong>{getDegreeName(selectedDegree)}</strong></h3>
          </div>

          {getObjectivesForCourse(selectedSection.courseId).length === 0 ? (
            <div className="no-objectives-warning">
              <p><strong>⚠️ No Learning Objectives Found</strong></p>
              <p>This course doesn't have any learning objectives mapped to it yet.</p>
              <p>To add objectives to this course, go to <strong>Associations → Course-Objective Mapping</strong> and map the objectives you want to evaluate.</p>
            </div>
          ) : (
            <div className="objectives-list-container">
              <h3>Learning Objectives to Evaluate</h3>
              <div className="objectives-list">
                {getObjectivesForCourse(selectedSection.courseId).map(objective => {
                  const status = getEvaluationStatusForObjective(objective.id);
                  return (
                    <div key={objective.id} className={`objective-list-item ${status}`}>
                      <div className="objective-info">
                        <h4>{objective.code}</h4>
                        <p>{objective.description}</p>
                      </div>
                      <div className="objective-status">
                        {status === 'completed' ? (
                          <span className="status-badge completed">✓ Completed</span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="btn-edit-objective"
                        onClick={() => handleSelectObjective(objective)}
                      >
                        {status === 'completed' ? 'Edit Evaluation' : 'Enter Evaluation'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="form-buttons">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setSelectedSection(null);
                    setObjectiveEvaluations({});
                    setValidationErrors({});
                    setCurrentObjectiveData({
                      assessmentMethod: '',
                      customAssessment: '',
                      countA: '',
                      countB: '',
                      countC: '',
                      countF: '',
                      comments: ''
                    });
                    fetchAllData();
                  }}
                >
                  Back to Sections
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="objective-edit-form">
          <button 
            type="button" 
            className="btn-back"
            onClick={() => {
              setSelectedObjective(null);
              setCurrentObjectiveData({
                assessmentMethod: '',
                countA: '',
                countB: '',
                countC: '',
                countF: '',
                comments: ''
              });
              setValidationErrors({});
            }}
          >
            ← Back to Objectives
          </button>

          <div className="objective-edit-header">
            <h3>{selectedObjective.code}</h3>
            <p>{selectedObjective.description}</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveObjective(); }}>
            <div className="form-group">
              <label>What is used to evaluate this objective *</label>
              <div className="assessment-method-group">
                <select
                  value={currentObjectiveData.assessmentMethod === 'Other' ? 'Other' : (currentObjectiveData.assessmentMethod || '')}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      handleObjectiveDataChange('assessmentMethod', 'Other');
                    } else {
                      handleObjectiveDataChange('assessmentMethod', e.target.value);
                    }
                  }}
                >
                  <option value="">Select assessment method</option>
                  {STANDARD_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                  <option value="Other">Other (please specify)</option>
                </select>
              </div>
              {currentObjectiveData.assessmentMethod === 'Other' && (
                <div className="custom-method-wrapper">
                  <input
                    type="text"
                    value={currentObjectiveData.customAssessment || ''}
                    onChange={(e) => handleObjectiveDataChange('customAssessment', e.target.value)}
                    placeholder="Please specify what you are evaluating"
                    className="custom-method-input"
                  />
                </div>
              )}
              {validationErrors.assessmentMethod && (
                <span className="field-error">{validationErrors.assessmentMethod}</span>
              )}
            </div>

            <div className="form-group">
              <label>Grade Distribution *</label>
              <p className="count-help-text">Enter how many students achieved each grade level</p>
              <div className="count-inputs">
                <div className="count-group">
                  <label htmlFor="countA">A:</label>
                  <input
                    id="countA"
                    type="number"
                    min="0"
                    value={currentObjectiveData.countA}
                    onChange={(e) => handleObjectiveDataChange('countA', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="count-group">
                  <label htmlFor="countB">B:</label>
                  <input
                    id="countB"
                    type="number"
                    min="0"
                    value={currentObjectiveData.countB}
                    onChange={(e) => handleObjectiveDataChange('countB', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="count-group">
                  <label htmlFor="countC">C:</label>
                  <input
                    id="countC"
                    type="number"
                    min="0"
                    value={currentObjectiveData.countC}
                    onChange={(e) => handleObjectiveDataChange('countC', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="count-group">
                  <label htmlFor="countF">F:</label>
                  <input
                    id="countF"
                    type="number"
                    min="0"
                    value={currentObjectiveData.countF}
                    onChange={(e) => handleObjectiveDataChange('countF', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              {validationErrors.counts && (
                <span className="field-error">{validationErrors.counts}</span>
              )}
            </div>

            <div className="form-group">
              <label>Improvement Suggestions (Optional)</label>
              <textarea
                value={currentObjectiveData.comments}
                onChange={(e) => handleObjectiveDataChange('comments', e.target.value)}
                placeholder="Enter any suggestions for improvement needed for this objective in future semesters..."
                rows="4"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-save">
                Save This Evaluation
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => {
                  setSelectedObjective(null);
                  setCurrentObjectiveData({
                    assessmentMethod: '',
                    customAssessment: '',
                    countA: '',
                    countB: '',
                    countC: '',
                    countF: '',
                    comments: ''
                  });
                  setValidationErrors({});
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default EvaluationManager;
