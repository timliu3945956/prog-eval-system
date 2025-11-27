import React, { useState, useEffect } from 'react';
import './InstructorQuery.css';

function InstructorQuery() {
  const [instructors, setInstructors] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [startSemester, setStartSemester] = useState('');
  const [endSemester, setEndSemester] = useState('');
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [instructorSearch, setInstructorSearch] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [instructorsRes, sectionsRes, coursesRes] = await Promise.all([
        fetch('http://localhost:8080/api/instructors'),
        fetch('http://localhost:8080/api/sections'),
        fetch('http://localhost:8080/api/courses')
      ]);

      if (!instructorsRes.ok || !sectionsRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const instructorsData = await instructorsRes.json();
      const sectionsData = await sectionsRes.json();
      const coursesData = await coursesRes.json();

      setInstructors(instructorsData);
      setSections(sectionsData);
      setCourses(coursesData);

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

  const getSectionsForInstructor = (instructorId) => {
    return sections.filter(s => s.instructorId === instructorId);
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.courseNumber}: ${course.title}` : `Course ${courseId}`;
  };

  const filterSectionsByDateRange = (sectionsToFilter) => {
    let filtered = sectionsToFilter;

    if (startSemester) {
      filtered = filtered.filter(s => {
        const sectionSemesterIndex = availableSemesters.indexOf(s.semester);
        const startIndex = availableSemesters.indexOf(startSemester);
        return sectionSemesterIndex >= startIndex;
      });
    }

    if (endSemester) {
      filtered = filtered.filter(s => {
        const sectionSemesterIndex = availableSemesters.indexOf(s.semester);
        const endIndex = availableSemesters.indexOf(endSemester);
        return sectionSemesterIndex <= endIndex;
      });
    }

    return filtered;
  };

  const sortSectionsBySemester = (sectionsToSort) => {
    return [...sectionsToSort].sort((a, b) => {
      const indexA = availableSemesters.indexOf(a.semester);
      const indexB = availableSemesters.indexOf(b.semester);
      return indexA - indexB;
    });
  };

  const getFilteredInstructors = () => {
    return instructors.filter(instructor =>
      instructor.name.toLowerCase().includes(instructorSearch.toLowerCase())
    );
  };

  if (loading) return <div className="instructor-query"><p>Loading data...</p></div>;

  return (
    <div className="instructor-query">
      <div className="query-header">
        <h2>Instructor Query</h2>
        <p>Select an instructor to view all sections taught for a specific semester range</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!selectedInstructor ? (
        <div className="instructor-selection">
          <h3>Select an Instructor</h3>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by instructor name..."
              value={instructorSearch}
              onChange={(e) => setInstructorSearch(e.target.value)}
            />
            {instructorSearch && (
              <button
                className="search-clear"
                onClick={() => setInstructorSearch('')}
              >
                ✕
              </button>
            )}
          </div>
          <div className="instructor-list">
            {getFilteredInstructors().map(instructor => (
              <button
                key={instructor.id}
                className="instructor-option"
                onClick={() => {
                  setSelectedInstructor(instructor.id);
                  setStartSemester('');
                  setEndSemester('');
                }}
              >
                <div className="instructor-name">{instructor.name}</div>
                <div className="instructor-id">Instructor ID: {instructor.instructorId}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="instructor-details">
          <button
            className="btn-back"
            onClick={() => {
              setSelectedInstructor(null);
              setStartSemester('');
              setEndSemester('');
            }}
          >
            ← Back to Instructors
          </button>

          <div className="instructor-info-header">
            <h3>{instructors.find(i => i.id === selectedInstructor)?.name}</h3>
            <p className="instructor-id-display">
              Instructor ID: {selectedInstructor}
            </p>
          </div>

          {/* Semester Range Filter */}
          <div className="query-section">
            <h4>Filter by Semester Range</h4>
            <div className="semester-filters">
              <div className="filter-group">
                <label>Start Semester (Optional):</label>
                <select
                  value={startSemester}
                  onChange={(e) => setStartSemester(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {availableSemesters.map(sem => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>End Semester (Optional):</label>
                <select
                  value={endSemester}
                  onChange={(e) => setEndSemester(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {availableSemesters.map(sem => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="query-section">
            <h4>Sections Taught</h4>
            {(() => {
              const instructorSections = getSectionsForInstructor(selectedInstructor);
              const filteredSections = filterSectionsByDateRange(instructorSections);
              const sortedSections = sortSectionsBySemester(filteredSections);

              return sortedSections.length === 0 ? (
                <p className="no-data">
                  No sections found for the selected instructor and semester range.
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Section</th>
                      <th>Semester</th>
                      <th>Enrollment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSections.map(section => (
                      <tr key={section.id}>
                        <td className="code">{getCourseName(section.courseId).split(':')[0]}</td>
                        <td>{section.sectionNumber}</td>
                        <td>{section.semester}</td>
                        <td className="number">{section.enrollment || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorQuery;
