import React, { useState, useEffect } from 'react';
import './DegreeCourseMappingManager.css';

function DegreeCourseMappingManager() {
  const [mappings, setMappings] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    degreeId: '',
    courseId: '',
    isCore: false
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [mappingsRes, degreesRes, coursesRes] = await Promise.all([
        fetch('http://localhost:8080/api/degree-course-mappings'),
        fetch('http://localhost:8080/api/degrees'),
        fetch('http://localhost:8080/api/courses')
      ]);

      if (!mappingsRes.ok || !degreesRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const mappingsData = await mappingsRes.json();
      const degreesData = await degreesRes.json();
      const coursesData = await coursesRes.json();

      setMappings(mappingsData);
      setDegrees(degreesData);
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.degreeId || !formData.courseId) {
      setError('Degree and Course are required');
      return;
    }

    try {
      const payload = {
        degreeId: parseInt(formData.degreeId),
        courseId: parseInt(formData.courseId),
        isCore: formData.isCore
      };

      let response;
      if (editingId) {
        response = await fetch(`http://localhost:8080/api/degree-course-mappings/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:8080/api/degree-course-mappings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFormData({ degreeId: '', courseId: '', isCore: false });
      setEditingId(null);
      setShowForm(false);
      fetchAllData();
      setError(null);
    } catch (err) {
      console.error('Failed to save mapping:', err.message);
      setError('Failed to save mapping');
    }
  };

  const handleEdit = (mapping) => {
    setFormData({
      degreeId: mapping.degreeId || '',
      courseId: mapping.courseId || '',
      isCore: mapping.isCore || false
    });
    setEditingId(mapping.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mapping?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/degree-course-mappings/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchAllData();
        setError(null);
      } catch (err) {
        console.error('Failed to delete mapping:', err.message);
        setError('Failed to delete mapping');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ degreeId: '', courseId: '', isCore: false });
    setEditingId(null);
    setShowForm(false);
  };

  const getDegreeName = (degreeId) => {
    const degree = degrees.find(d => d.id === degreeId);
    return degree ? `${degree.name} (${degree.level})` : `Degree ${degreeId}`;
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.courseNumber} - ${course.title}` : `Course ${courseId}`;
  };

  if (loading) return <div className="mapping-manager"><p>Loading mappings...</p></div>;

  return (
    <div className="mapping-manager">
      <div className="mapping-header">
        <h2>Program Curriculum</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Curriculum Entry'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mapping-form">
          <div className="form-group">
            <label>Degree *</label>
            <select
              name="degreeId"
              value={formData.degreeId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a degree</option>
              {degrees.map(degree => (
                <option key={degree.id} value={degree.id}>
                  {degree.name} ({degree.level})
                </option>
              ))}
            </select>
          </div>
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
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="isCore"
                checked={formData.isCore}
                onChange={handleInputChange}
              />
              Is Core Course
            </label>
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-save">
              {editingId ? 'Update Curriculum Entry' : 'Add Curriculum Entry'}
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {mappings.length === 0 ? (
        <p className="no-data">No curriculum entries found. Add one to get started!</p>
      ) : (
        <table className="mapping-table">
          <thead>
            <tr>
              <th>Degree</th>
              <th>Course</th>
              <th>Core Course</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map(mapping => (
              <tr key={mapping.id}>
                <td>{getDegreeName(mapping.degreeId)}</td>
                <td>{getCourseName(mapping.courseId)}</td>
                <td>{mapping.isCore ? 'Yes' : 'No'}</td>
                <td className="actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(mapping)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(mapping.id)}
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

export default DegreeCourseMappingManager;
