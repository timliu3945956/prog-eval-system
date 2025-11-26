import React, { useState, useEffect } from 'react';
import './SectionManager.css';

function SectionManager() {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    instructorId: '',
    semester: '',
    year: '',
    sectionNumber: '',
    enrollment: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch sections, courses, and instructors on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, coursesRes, instructorsRes] = await Promise.all([
        fetch('http://localhost:8080/api/sections'),
        fetch('http://localhost:8080/api/courses'),
        fetch('http://localhost:8080/api/instructors')
      ]);

      if (!sectionsRes.ok || !coursesRes.ok || !instructorsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const sectionsData = await sectionsRes.json();
      const coursesData = await coursesRes.json();
      const instructorsData = await instructorsRes.json();

      setSections(sectionsData);
      setCourses(coursesData);
      setInstructors(instructorsData);
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
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.courseId) {
      errors.courseId = 'Course is required';
    }

    if (!formData.instructorId) {
      errors.instructorId = 'Instructor is required';
    }

    if (!formData.semester) {
      errors.semester = 'Semester is required';
    }

    if (!formData.year) {
      errors.year = 'Year is required';
    } else if (isNaN(formData.year) || formData.year < 2000 || formData.year > 2100) {
      errors.year = 'Year must be a valid number between 2000 and 2100';
    }

    if (!formData.sectionNumber) {
      errors.sectionNumber = 'Section Number is required';
    } else if (!/^\d{3}$/.test(formData.sectionNumber)) {
      errors.sectionNumber = 'Section Number must be exactly 3 digits (e.g., 001)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Get degreeId from selected course
    const selectedCourse = courses.find(c => c.id === parseInt(formData.courseId));
    if (!selectedCourse) {
      setError('Invalid course selected');
      return;
    }
    
    console.log('Selected course:', selectedCourse);
    console.log('DegreeId:', selectedCourse.degreeId);
    
    if (!selectedCourse.degreeId) {
      setError('Selected course has no associated degree. Please ensure the course is mapped to a degree.');
      return;
    }

    try {
      const semester = `${formData.semester} ${formData.year}`;
      const payload = {
        degreeId: selectedCourse.degreeId,
        courseId: parseInt(formData.courseId),
        instructorId: parseInt(formData.instructorId),
        semester: semester,
        sectionNumber: formData.sectionNumber,
        enrollment: formData.enrollment ? parseInt(formData.enrollment) : null
      };
      
      console.log('Payload:', payload);

      let response;
      if (editingId) {
        // Update existing section
        response = await fetch(`http://localhost:8080/api/sections/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new section
        response = await fetch('http://localhost:8080/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form and refresh list
      setFormData({ courseId: '', instructorId: '', semester: '', year: '', sectionNumber: '', enrollment: '' });
      setValidationErrors({});
      setEditingId(null);
      setShowForm(false);
      fetchAllData();
      setError(null);
    } catch (err) {
      console.error('Failed to save section:', err.message);
      setError('Failed to save section');
    }
  };

  const handleEdit = (section) => {
    // Parse semester string to extract semester and year (e.g., "Fall 2024" -> "Fall", "2024")
    const [semesterPart, yearPart] = section.semester.split(' ');
    setFormData({
      courseId: section.courseId || '',
      instructorId: section.instructorId || '',
      semester: semesterPart || '',
      year: yearPart || '',
      sectionNumber: section.sectionNumber,
      enrollment: section.enrollment || ''
    });
    setEditingId(section.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/sections/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchAllData();
        setError(null);
      } catch (err) {
        console.error('Failed to delete section:', err.message);
        setError('Failed to delete section');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ courseId: '', instructorId: '', semester: '', year: '', sectionNumber: '', enrollment: '' });
    setValidationErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="section-manager"><p>Loading sections...</p></div>;

  return (
    <div className="section-manager">
      <div className="section-header">
        <h2>Sections</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Section'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="section-form">
          <div className="form-group">
            <label>Course *</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.courseNumber} - {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Instructor *</label>
            <select
              name="instructorId"
              value={formData.instructorId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select an instructor</option>
              {instructors.map(instructor => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name} ({instructor.instructorId})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Semester *</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a semester</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
            </select>
            {validationErrors.semester && <span className="field-error">{validationErrors.semester}</span>}
          </div>
          <div className="form-group">
            <label>Year *</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="e.g., 2024"
              min="2000"
              max="2100"
              required
            />
            {validationErrors.year && <span className="field-error">{validationErrors.year}</span>}
          </div>
          <div className="form-group">
            <label>Section Number *</label>
            <input
              type="text"
              name="sectionNumber"
              value={formData.sectionNumber}
              onChange={handleInputChange}
              placeholder="e.g., 001"
              maxLength="3"
              required
            />
            {validationErrors.sectionNumber && <span className="field-error">{validationErrors.sectionNumber}</span>}
          </div>
          <div className="form-group">
            <label>Enrollment</label>
            <input
              type="number"
              name="enrollment"
              value={formData.enrollment}
              onChange={handleInputChange}
              placeholder="e.g., 30"
              min="0"
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-save">
              {editingId ? 'Update Section' : 'Add Section'}
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {sections.length === 0 ? (
        <p className="no-data">No sections found. Add one to get started!</p>
      ) : (
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course</th>
              <th>Instructor</th>
              <th>Semester</th>
              <th>Section #</th>
              <th>Enrollment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(section => (
              <tr key={section.id}>
                <td>{section.id}</td>
                <td>{section.courseNumber && section.courseTitle ? `${section.courseNumber} - ${section.courseTitle}` : 'Course undefined'}</td>
                <td>{section.instructorName || 'Instructor undefined'}</td>
                <td>{section.semester}</td>
                <td>{section.sectionNumber}</td>
                <td>{section.enrollment || '-'}</td>
                <td className="actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(section)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(section.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SectionManager;
