import React, { useState, useEffect } from 'react';
import './CourseObjectiveMappingManager.css';

function CourseObjectiveMappingManager() {
  const [mappings, setMappings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    objectiveId: ''
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [mappingsRes, coursesRes, objectivesRes] = await Promise.all([
        fetch('http://localhost:8080/api/course-objective-mappings'),
        fetch('http://localhost:8080/api/courses'),
        fetch('http://localhost:8080/api/objectives')
      ]);

      if (!mappingsRes.ok || !coursesRes.ok || !objectivesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const mappingsData = await mappingsRes.json();
      const coursesData = await coursesRes.json();
      const objectivesData = await objectivesRes.json();

      console.log('Courses data:', coursesData);
      console.log('Objectives data:', objectivesData);

      setMappings(mappingsData);
      setCourses(coursesData);
      setObjectives(objectivesData);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseId || !formData.objectiveId) {
      setError('Course and Learning Objective are required');
      return;
    }

    try {
      const payload = {
        courseId: parseInt(formData.courseId),
        objectiveId: parseInt(formData.objectiveId)
      };

      let response;
      if (editingId) {
        // Update existing mapping
        response = await fetch(`http://localhost:8080/api/course-objective-mappings/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new mapping
        response = await fetch('http://localhost:8080/api/course-objective-mappings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form and refresh list
      setFormData({ courseId: '', objectiveId: '' });
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
      courseId: (mapping.course?.id || mapping.courseId || '').toString(),
      objectiveId: (mapping.objective?.id || mapping.objectiveId || '').toString()
    });
    setEditingId(mapping.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course-objective association?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/course-objective-mappings/${id}`, {
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
    setFormData({ courseId: '', objectiveId: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const getCourseName = (mapping) => {
    if (!mapping) return 'N/A';
    // If it's from the new DTO format
    if (mapping.courseNumber && mapping.courseTitle) {
      return `${mapping.courseNumber} - ${mapping.courseTitle}`;
    }
    // Fallback for old format
    const course = courses.find(c => c.id === (typeof mapping === 'object' ? mapping.id : mapping));
    return course ? `${course.courseNumber} - ${course.title}` : 'N/A';
  };

  const getObjectiveInfo = (mapping) => {
    if (!mapping) return 'N/A';
    // If it's from the new DTO format
    if (mapping.objectiveCode && mapping.objectiveTitle) {
      return `${mapping.objectiveCode} - ${mapping.objectiveTitle}`;
    }
    // Fallback for old format
    const objective = objectives.find(o => o.id === (typeof mapping === 'object' ? mapping.id : mapping));
    return objective ? `${objective.code} - ${objective.title}` : 'N/A';
  };

  if (loading) return <div className="mapping-manager"><p>Loading course-objective associations...</p></div>;

  return (
    <div className="mapping-manager">
      <div className="mapping-header">
        <h2>Associate Courses with Learning Objectives</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Association'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mapping-form">
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
            <label>Learning Objective *</label>
            <select
              name="objectiveId"
              value={formData.objectiveId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a learning objective</option>
              {objectives.map(objective => (
                <option key={objective.id} value={objective.id}>
                  {objective.code} - {objective.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-save">
              {editingId ? 'Update Association' : 'Add Association'}
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {mappings.length === 0 ? (
        <p className="no-data">No course-objective associations found. Add one to get started!</p>
      ) : (
        <table className="mapping-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course</th>
              <th>Learning Objective</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map(mapping => (
              <tr key={mapping.id}>
                <td>{mapping.id}</td>
                <td>{getCourseName(mapping)}</td>
                <td>{getObjectiveInfo(mapping)}</td>
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

export default CourseObjectiveMappingManager;
