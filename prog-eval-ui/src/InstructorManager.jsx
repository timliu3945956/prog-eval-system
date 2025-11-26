import React, { useState, useEffect } from 'react';
import './InstructorManager.css';

function InstructorManager() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    instructorId: '',
    name: ''
  });

  // Fetch instructors on component mount
  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/instructors');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInstructors(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch instructors:', err.message);
      setError('Failed to load instructors');
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
    
    if (!formData.instructorId.trim() || !formData.name.trim()) {
      setError('Instructor ID and Name are required');
      return;
    }

    try {
      let response;
      if (editingId) {
        // Update existing instructor
        response = await fetch(`http://localhost:8080/api/instructors/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new instructor
        response = await fetch('http://localhost:8080/api/instructors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form and refresh list
      setFormData({ instructorId: '', name: '' });
      setEditingId(null);
      setShowForm(false);
      fetchInstructors();
      setError(null);
    } catch (err) {
      console.error('Failed to save instructor:', err.message);
      setError('Failed to save instructor');
    }
  };

  const handleEdit = (instructor) => {
    setFormData({
      instructorId: instructor.instructorId,
      name: instructor.name
    });
    setEditingId(instructor.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this instructor?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/instructors/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchInstructors();
        setError(null);
      } catch (err) {
        console.error('Failed to delete instructor:', err.message);
        setError('Failed to delete instructor');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ instructorId: '', name: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="instructor-manager"><p>Loading instructors...</p></div>;

  return (
    <div className="instructor-manager">
      <div className="instructor-header">
        <h2>Instructors</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Instructor'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="instructor-form">
          <div className="form-group">
            <label>Instructor ID *</label>
            <input
              type="text"
              name="instructorId"
              value={formData.instructorId}
              onChange={handleInputChange}
              placeholder="e.g., 000123"
              required
            />
          </div>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Dr. Jane Doe"
              required
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-save">
              {editingId ? 'Update Instructor' : 'Add Instructor'}
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {instructors.length === 0 ? (
        <p className="no-data">No instructors found. Add one to get started!</p>
      ) : (
        <table className="instructor-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Instructor ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map(instructor => (
              <tr key={instructor.id}>
                <td>{instructor.id}</td>
                <td>{instructor.instructorId}</td>
                <td>{instructor.name}</td>
                <td className="actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(instructor)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(instructor.id)}
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

export default InstructorManager;
