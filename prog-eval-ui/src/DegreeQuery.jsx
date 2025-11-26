import React, { useState, useEffect } from 'react';
import './DegreeQuery.css';

function DegreeQuery() {
  const [degrees, setDegrees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [degreeMappings, setDegreeMappings] = useState([]);
  const [courseMappings, setCourseMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDegree, setSelectedDegree] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [degreeSearch, setDegreeSearch] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [degreesRes, coursesRes, sectionsRes, objectivesRes, mappingsRes, courseMappingsRes] = await Promise.all([
        fetch('http://localhost:8080/api/degrees'),
        fetch('http://localhost:8080/api/courses'),
        fetch('http://localhost:8080/api/sections'),
        fetch('http://localhost:8080/api/objectives'),
        fetch('http://localhost:8080/api/degree-course-mappings'),
        fetch('http://localhost:8080/api/course-objective-mappings')
      ]);

      if (!degreesRes.ok || !coursesRes.ok || !sectionsRes.ok || !objectivesRes.ok || !mappingsRes.ok || !courseMappingsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const degreesData = await degreesRes.json();
      const coursesData = await coursesRes.json();
      const sectionsData = await sectionsRes.json();
      const objectivesData = await objectivesRes.json();
      const mappingsData = await mappingsRes.json();
      const courseMappingsData = await courseMappingsRes.json();

      setDegrees(degreesData);
      setCourses(coursesData);
      setSections(sectionsData);
      setObjectives(objectivesData);
      setDegreeMappings(mappingsData);
      setCourseMappings(courseMappingsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err.message);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCoursesForDegree = (degreeId) => {
    const courseIds = degreeMappings
      .filter(m => m.degreeId === degreeId)
      .map(m => m.courseId);
    return courses.filter(c => courseIds.includes(c.id));
  };

  const getSectionsForCourse = (courseId) => {
    return sections.filter(s => s.courseId === courseId);
  };

  const getObjectivesForCourse = (courseId) => {
    const mappings = courseMappings.filter(m => m.courseId === courseId);
    const objectiveIds = mappings.map(m => m.objectiveId);
    return objectives.filter(o => objectiveIds.includes(o.id));
  };

  const getCoursesForObjective = (objectiveId) => {
    const mappings = courseMappings.filter(m => m.objectiveId === objectiveId);
    const courseIds = mappings.map(m => m.courseId);
    return courses.filter(c => courseIds.includes(c.id));
  };

  const sortSectionsByDate = (sectionsToSort) => {
    return [...sectionsToSort].sort((a, b) => {
      const dateA = new Date(a.semester);
      const dateB = new Date(b.semester);
      return dateA - dateB;
    });
  };

  const filterSectionsByDateRange = (sectionsToFilter) => {
    let filtered = sectionsToFilter;
    
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(s => new Date(s.semester) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(s => new Date(s.semester) <= end);
    }
    
    return filtered;
  };

  if (loading) return <div className="degree-query"><p>Loading data...</p></div>;

  const getFilteredDegrees = () => {
    return degrees.filter(degree =>
      degree.name.toLowerCase().includes(degreeSearch.toLowerCase()) ||
      degree.level.toLowerCase().includes(degreeSearch.toLowerCase())
    );
  };

  return (
    <div className="degree-query">
      <div className="query-header">
        <h2>Degree Query</h2>
        <p>Select a degree to view its courses, sections, and objectives</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!selectedDegree ? (
        <div className="degree-selection">
          <h3>Select a Degree</h3>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by degree name or level..."
              value={degreeSearch}
              onChange={(e) => setDegreeSearch(e.target.value)}
            />
            {degreeSearch && (
              <button
                className="search-clear"
                onClick={() => setDegreeSearch('')}
              >
                ✕
              </button>
            )}
          </div>
          <div className="degree-list">
            {getFilteredDegrees().map(degree => (
              <button
                key={degree.id}
                className="degree-option"
                onClick={() => setSelectedDegree(degree.id)}
              >
                <div className="degree-name">{degree.name}</div>
                <div className="degree-level">{degree.level}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="degree-details">
          <button
            className="btn-back"
            onClick={() => {
              setSelectedDegree(null);
              setStartDate('');
              setEndDate('');
            }}
          >
            ← Back to Degrees
          </button>

          <div className="degree-info-header">
            <h3>{degrees.find(d => d.id === selectedDegree)?.name}</h3>
            <p>{degrees.find(d => d.id === selectedDegree)?.level}</p>
          </div>

          {/* Courses Section */}
          <div className="query-section">
            <h4>Associated Courses</h4>
            {getCoursesForDegree(selectedDegree).length === 0 ? (
              <p className="no-data">No courses associated with this degree.</p>
            ) : (
              <div className="courses-list">
                {getCoursesForDegree(selectedDegree).map(course => (
                  <div key={course.id} className="course-item">
                    <div className="course-info">
                      <h5>{course.courseNumber}: {course.title}</h5>
                      <p className="course-desc">{course.description || 'No description'}</p>
                    </div>
                    <div className="course-badge">
                      {degreeMappings.find(m => m.courseId === course.id && m.degreeId === selectedDegree)?.isCore
                        ? <span className="badge-core">CORE</span>
                        : <span className="badge-elective">ELECTIVE</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sections Section */}
          <div className="query-section">
            <h4>Sections Offered</h4>
            <div className="date-filters">
              <div className="filter-group">
                <label>Start Date (Optional):</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>End Date (Optional):</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            {(() => {
              const degreeCourses = getCoursesForDegree(selectedDegree);
              const allSections = degreeCourses.flatMap(course => 
                getSectionsForCourse(course.id)
              );
              const filteredSections = filterSectionsByDateRange(allSections);
              const sortedSections = sortSectionsByDate(filteredSections);
              
              return sortedSections.length === 0 ? (
                <p className="no-data">No sections found for the selected criteria.</p>
              ) : (
                <div className="sections-list">
                  {sortedSections.map(section => {
                    const course = courses.find(c => c.id === section.courseId);
                    return (
                      <div key={section.id} className="section-item">
                        <div className="section-info">
                          <h5>{course?.courseNumber} - Section {section.sectionNumber}</h5>
                          <p><strong>Semester:</strong> {section.semester}</p>
                          <p><strong>Enrollment:</strong> {section.enrollment || 'N/A'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Objectives Section */}
          <div className="query-section">
            <h4>Learning Objectives</h4>
            {(() => {
              const degreeCourses = getCoursesForDegree(selectedDegree);
              const allObjectives = degreeCourses.flatMap(course =>
                getObjectivesForCourse(course.id)
              );
              const uniqueObjectives = Array.from(new Map(allObjectives.map(obj => [obj.id, obj])).values());
              
              return uniqueObjectives.length === 0 ? (
                <p className="no-data">No objectives associated with this degree.</p>
              ) : (
                <div className="objectives-list">
                  {uniqueObjectives.map(objective => (
                    <div key={objective.id} className="objective-item">
                      <div className="objective-info">
                        <h5>{objective.code}</h5>
                        <p>{objective.description}</p>
                      </div>
                      <div className="objective-courses">
                        <strong>Courses:</strong>
                        <div className="course-tags">
                          {getCoursesForObjective(objective.id).map(course => (
                            <span key={course.id} className="course-tag">
                              {course.courseNumber}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default DegreeQuery;
