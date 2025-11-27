import React, { useState, useEffect } from 'react';
import './CourseQuery.css';

function CourseQuery() {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [startSemester, setStartSemester] = useState('');
  const [endSemester, setEndSemester] = useState('');
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [coursesRes, sectionsRes, instructorsRes] = await Promise.all([
        fetch('http://localhost:8080/api/courses'),
        fetch('http://localhost:8080/api/sections'),
        fetch('http://localhost:8080/api/instructors')
      ]);

      if (!coursesRes.ok || !sectionsRes.ok || !instructorsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const coursesData = await coursesRes.json();
      const sectionsData = await sectionsRes.json();
      const instructorsData = await instructorsRes.json();

      setCourses(coursesData);
      setSections(sectionsData);
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

  const getSectionsForCourse = (courseId) => {
    return sections.filter(s => s.courseId === courseId);
  };

  const getInstructorName = (instructorId) => {
    const instructor = instructors.find(i => i.id === instructorId);
    return instructor ? instructor.name : `Instructor ${instructorId}`;
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

  const getFilteredCourses = () => {
    return courses.filter(course =>
      course.courseNumber.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.title.toLowerCase().includes(courseSearch.toLowerCase())
    );
  };

  if (loading) return <div className="course-query"><p>Loading data...</p></div>;

  return (
    <div className="course-query">
      <div className="query-header">
        <h2>Course Query</h2>
        <p>Select a course to view all sections offered for a specific semester range</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!selectedCourse ? (
        <div className="course-selection">
          <h3>Select a Course</h3>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by course number or title..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />
            {courseSearch && (
              <button
                className="search-clear"
                onClick={() => setCourseSearch('')}
              >
                ✕
              </button>
            )}
          </div>
          <div className="course-list">
            {getFilteredCourses().map(course => (
              <button
                key={course.id}
                className="course-option"
                onClick={() => {
                  setSelectedCourse(course.id);
                  setStartSemester('');
                  setEndSemester('');
                }}
              >
                <div className="course-number">{course.courseNumber}</div>
                <div className="course-title">{course.title}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="course-details">
          <button
            className="btn-back"
            onClick={() => {
              setSelectedCourse(null);
              setStartSemester('');
              setEndSemester('');
            }}
          >
            ← Back to Courses
          </button>

          <div className="course-info-header">
            <h3>{courses.find(c => c.id === selectedCourse)?.courseNumber}</h3>
            <h4>{courses.find(c => c.id === selectedCourse)?.title}</h4>
            {courses.find(c => c.id === selectedCourse)?.description && (
              <p className="course-description">
                {courses.find(c => c.id === selectedCourse)?.description}
              </p>
            )}
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
            <h4>Sections</h4>
            {(() => {
              const courseSections = getSectionsForCourse(selectedCourse);
              const filteredSections = filterSectionsByDateRange(courseSections);
              const sortedSections = sortSectionsBySemester(filteredSections);

              return sortedSections.length === 0 ? (
                <p className="no-data">
                  No sections found for the selected course and semester range.
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Semester</th>
                      <th>Instructor</th>
                      <th>Enrollment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSections.map(section => (
                      <tr key={section.id}>
                        <td>{section.sectionNumber}</td>
                        <td>{section.semester}</td>
                        <td>{getInstructorName(section.instructorId)}</td>
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

export default CourseQuery;
