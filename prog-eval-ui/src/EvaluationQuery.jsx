import React, { useState, useEffect } from 'react';
import './EvaluationQuery.css';

function EvaluationQuery() {
  const [sections, setSections] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSemester, setSelectedSemester] = useState('');
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [queryType, setQueryType] = useState('status'); // 'status' or 'passRate'
  const [passRateThreshold, setPassRateThreshold] = useState('');
  const [queryResults, setQueryResults] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, evaluationsRes, coursesRes, instructorsRes] = await Promise.all([
        fetch('http://localhost:8080/api/sections'),
        fetch('http://localhost:8080/api/evaluations'),
        fetch('http://localhost:8080/api/courses'),
        fetch('http://localhost:8080/api/instructors')
      ]);

      if (!sectionsRes.ok || !evaluationsRes.ok || !coursesRes.ok || !instructorsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const sectionsData = await sectionsRes.json();
      const evaluationsData = await evaluationsRes.json();
      const coursesData = await coursesRes.json();
      const instructorsData = await instructorsRes.json();

      setSections(sectionsData);
      setEvaluations(evaluationsData);
      setCourses(coursesData);
      setInstructors(instructorsData);

      // Extract unique semesters and sort them
      const uniqueSemesters = [...new Set(sectionsData.map(s => s.semester))].sort();
      setAvailableSemesters(uniqueSemesters);

      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err.message);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.courseNumber}: ${course.title}` : `Course ${courseId}`;
  };

  const getInstructorName = (instructorId) => {
    const instructor = instructors.find(i => i.id === instructorId);
    return instructor ? instructor.name : `Instructor ${instructorId}`;
  };

  const getEvaluationStatus = (section) => {
    const sectionEvals = evaluations.filter(e => e.sectionId === section.id);

    if (sectionEvals.length === 0) {
      return 'not-entered';
    }

    // Check if all evaluations have all required fields filled
    const allComplete = sectionEvals.every(e => {
      const hasGrades = e.countA !== null || e.countB !== null || e.countC !== null || e.countF !== null;
      const hasMethod = e.assessmentMethod && e.assessmentMethod.trim() !== '';
      return hasGrades && hasMethod;
    });

    if (allComplete) {
      // Check if all have improvement comments
      const allHaveComments = sectionEvals.every(e => e.comments && e.comments.trim() !== '');
      return allHaveComments ? 'complete-with-comments' : 'complete';
    }

    return 'partial';
  };

  const handleStatusQuery = () => {
    if (!selectedSemester) {
      setError('Please select a semester');
      return;
    }

    const semesterSections = sections.filter(s => s.semester === selectedSemester);
    
    const results = semesterSections.map(section => ({
      section,
      status: getEvaluationStatus(section),
      evaluationCount: evaluations.filter(e => e.sectionId === section.id).length,
      evaluations: evaluations.filter(e => e.sectionId === section.id)
    }));

    setQueryResults({
      type: 'status',
      semester: selectedSemester,
      totalSections: results.length,
      data: results
    });
  };

  const handlePassRateQuery = () => {
    if (!selectedSemester) {
      setError('Please select a semester');
      return;
    }

    if (passRateThreshold === '' || isNaN(passRateThreshold) || passRateThreshold < 0 || passRateThreshold > 100) {
      setError('Please enter a valid percentage (0-100)');
      return;
    }

    const semesterSections = sections.filter(s => s.semester === selectedSemester);

    const results = semesterSections
      .map(section => {
        const sectionEvals = evaluations.filter(e => e.sectionId === section.id);
        
        if (sectionEvals.length === 0) {
          return {
            section,
            totalStudents: section.enrollment || 0,
            passCount: 0,
            passRate: 0,
            passRatePercentage: 0,
            meetsThreshold: false,
            evaluationCount: 0
          };
        }

        // Calculate total students and passing students
        let totalStudents = 0;
        let passCount = 0;

        sectionEvals.forEach(e => {
          const evalTotal = (e.countA || 0) + (e.countB || 0) + (e.countC || 0) + (e.countF || 0);
          totalStudents += evalTotal;
          passCount += (e.countA || 0) + (e.countB || 0) + (e.countC || 0);
        });

        const passRate = totalStudents > 0 ? (passCount / totalStudents) : 0;
        const passRatePercentage = Math.round(passRate * 100);

        return {
          section,
          totalStudents,
          passCount,
          passRate: passRate.toFixed(4),
          passRatePercentage,
          meetsThreshold: passRatePercentage >= parseFloat(passRateThreshold),
          evaluationCount: sectionEvals.length
        };
      })
      .filter(r => r.evaluationCount > 0)
      .sort((a, b) => b.passRatePercentage - a.passRatePercentage);

    setQueryResults({
      type: 'passRate',
      semester: selectedSemester,
      threshold: parseFloat(passRateThreshold),
      meetsThresholdCount: results.filter(r => r.meetsThreshold).length,
      data: results
    });
  };

  const renderStatusResults = () => {
    if (!queryResults || queryResults.type !== 'status') return null;

    const statusCounts = {
      'complete-with-comments': 0,
      'complete': 0,
      'partial': 0,
      'not-entered': 0
    };

    queryResults.data.forEach(item => {
      statusCounts[item.status]++;
    });

    return (
      <div className="query-results">
        <div className="results-header">
          <h3>Evaluation Status Report - {queryResults.semester}</h3>
          <div className="status-summary">
            <div className="summary-item complete-with-comments">
              <span className="status-badge">✓ Complete with Improvement Notes</span>
              <span className="count">{statusCounts['complete-with-comments']}</span>
            </div>
            <div className="summary-item complete">
              <span className="status-badge">✓ Complete</span>
              <span className="count">{statusCounts['complete']}</span>
            </div>
            <div className="summary-item partial">
              <span className="status-badge">◐ Partial</span>
              <span className="count">{statusCounts['partial']}</span>
            </div>
            <div className="summary-item not-entered">
              <span className="status-badge">✗ Not Entered</span>
              <span className="count">{statusCounts['not-entered']}</span>
            </div>
          </div>
        </div>

        <div className="results-list">
          {queryResults.data.map(item => (
            <div key={item.section.id} className={`result-item status-${item.status}`}>
              <div className="result-header">
                <div className="section-info">
                  <h4>{getCourseName(item.section.courseId)}</h4>
                  <p>Section {item.section.sectionNumber} • {getInstructorName(item.section.instructorId)}</p>
                  <p>Enrollment: {item.section.enrollment || 'N/A'}</p>
                </div>
                <div className={`status-indicator status-${item.status}`}>
                  {item.status === 'complete-with-comments' && '✓ Complete with Notes'}
                  {item.status === 'complete' && '✓ Complete'}
                  {item.status === 'partial' && '◐ Partial'}
                  {item.status === 'not-entered' && '✗ Not Entered'}
                </div>
              </div>

              {item.evaluationCount > 0 && (
                <div className="evaluation-details">
                  <p className="eval-count">Evaluations: {item.evaluationCount}</p>
                  <div className="objectives-list">
                    {item.evaluations.map(e => (
                      <div key={e.id} className="objective-eval">
                        <div className="objective-info">
                          <p className="assessment">{e.assessmentMethod}</p>
                          <div className="grades">
                            <span>A: {e.countA}</span>
                            <span>B: {e.countB}</span>
                            <span>C: {e.countC}</span>
                            <span>F: {e.countF}</span>
                          </div>
                        </div>
                        {e.comments && (
                          <div className="comments">
                            <strong>Improvement Notes:</strong>
                            <p>{e.comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPassRateResults = () => {
    if (!queryResults || queryResults.type !== 'passRate') return null;

    return (
      <div className="query-results">
        <div className="results-header">
          <h3>Pass Rate Report - {queryResults.semester}</h3>
          <div className="threshold-info">
            <p>Threshold: {queryResults.threshold}%</p>
            <p className="result-summary">
              <strong>{queryResults.meetsThresholdCount}</strong> section(s) meet or exceed {queryResults.threshold}% pass rate
            </p>
          </div>
        </div>

        <div className="results-list pass-rate-results">
          {queryResults.data.map(item => (
            <div key={item.section.id} className={`result-item ${item.meetsThreshold ? 'meets-threshold' : 'below-threshold'}`}>
              <div className="result-header">
                <div className="section-info">
                  <h4>{getCourseName(item.section.courseId)}</h4>
                  <p>Section {item.section.sectionNumber} • {getInstructorName(item.section.instructorId)}</p>
                  <p>Enrollment: {item.section.enrollment || 'N/A'}</p>
                </div>
                <div className="pass-rate-display">
                  <div className={`pass-rate-circle ${item.meetsThreshold ? 'meets' : 'below'}`}>
                    <span className="percentage">{item.passRatePercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="pass-rate-details">
                <div className="stat-row">
                  <span className="stat-label">Total Students:</span>
                  <span className="stat-value">{item.totalStudents}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Students Not F:</span>
                  <span className="stat-value">{item.passCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Evaluations:</span>
                  <span className="stat-value">{item.evaluationCount}</span>
                </div>
                {item.passRatePercentage >= queryResults.threshold ? (
                  <div className="threshold-met">✓ Meets {queryResults.threshold}% threshold</div>
                ) : (
                  <div className="threshold-not-met">✗ Below {queryResults.threshold}% threshold</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="evaluation-query"><p>Loading data...</p></div>;

  return (
    <div className="evaluation-query">
      <div className="query-header">
        <h2>Evaluation Query</h2>
        <p>Analyze evaluation status and student performance across sections</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="query-setup">
        <div className="setup-section">
          <h3>Query Configuration</h3>

          <div className="control-group">
            <label>Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setQueryResults(null);
              }}
            >
              <option value="">Select a semester...</option>
              {availableSemesters.map(semester => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          <div className="query-type-selector">
            <h4>Select Query Type:</h4>
            <div className="query-options">
              <div className="query-option">
                <input
                  type="radio"
                  id="query-status"
                  name="queryType"
                  value="status"
                  checked={queryType === 'status'}
                  onChange={(e) => {
                    setQueryType(e.target.value);
                    setQueryResults(null);
                  }}
                />
                <label htmlFor="query-status">
                  <strong>Evaluation Status</strong>
                  <span className="description">Check completion status of evaluations and improvement notes</span>
                </label>
              </div>

              <div className="query-option">
                <input
                  type="radio"
                  id="query-passrate"
                  name="queryType"
                  value="passRate"
                  checked={queryType === 'passRate'}
                  onChange={(e) => {
                    setQueryType(e.target.value);
                    setQueryResults(null);
                  }}
                />
                <label htmlFor="query-passrate">
                  <strong>Pass Rate Analysis</strong>
                  <span className="description">Find sections where % of students with grades A, B, or C meet a threshold</span>
                </label>
              </div>
            </div>
          </div>

          {queryType === 'passRate' && (
            <div className="control-group">
              <label>Pass Rate Threshold (%):</label>
              <div className="threshold-input-group">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passRateThreshold}
                  onChange={(e) => setPassRateThreshold(e.target.value)}
                  placeholder="Enter percentage (0-100)"
                />
                <span className="unit">%</span>
              </div>
              <small>Students with grades A, B, or C / Total evaluated students</small>
            </div>
          )}

          <div className="button-group">
            <button
              className="btn-query"
              onClick={queryType === 'status' ? handleStatusQuery : handlePassRateQuery}
              disabled={!selectedSemester || (queryType === 'passRate' && passRateThreshold === '')}
            >
              Run Query
            </button>
          </div>
        </div>
      </div>

      {queryType === 'status' && renderStatusResults()}
      {queryType === 'passRate' && renderPassRateResults()}
    </div>
  );
}

export default EvaluationQuery;
