import React, { useState, useEffect } from 'react';
import './LearningObjectiveManager.css';

function LearningObjectiveManager() {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: ''
  });

  // Fetch learning objectives on component mount
  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/objectives');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setObjectives(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch learning objectives:', err.message);
      setError('Failed to load learning objectives');
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
    
    if (!formData.code.trim() || !formData.title.trim()) {
      setError('Code and Title are required');
      return;
    }

    try {
      let response;
      if (editingId) {
        // Update existing learning objective
        response = await fetch(`http://localhost:8080/api/objectives/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new learning objective
        response = await fetch('http://localhost:8080/api/objectives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form and refresh list
      setFormData({ code: '', title: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      fetchObjectives();
      setError(null);
    } catch (err) {
      console.error('Failed to save learning objective:', err.message);
      setError('Failed to save learning objective');
    }
  };

  const handleEdit = (objective) => {
    setFormData({
      code: objective.code,
      title: objective.title,
      description: objective.description || ''
    });
    setEditingId(objective.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this learning objective?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/objectives/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchObjectives();
        setError(null);
      } catch (err) {
        console.error('Failed to delete learning objective:', err.message);
        setError('Failed to delete learning objective');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ code: '', title: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="objective-manager"><p>Loading learning objectives...</p></div>;

  return (
    <div className="objective-manager">
      <div className="objective-header">
        <h2>Learning Objectives</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Learning Objective'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="objective-form">
          <div className="form-group">
            <label>Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., LO-1"
              required
            />
          </div>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Understand fundamental concepts"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional detailed description"
              rows="4"
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-save">
              {editingId ? 'Update Learning Objective' : 'Add Learning Objective'}
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {objectives.length === 0 ? (
        <p className="no-data">No learning objectives found. Add one to get started!</p>
      ) : (
        <table className="objective-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {objectives.map(objective => (
              <tr key={objective.id}>
                <td>{objective.id}</td>
                <td><span className="code-badge">{objective.code}</span></td>
                <td>{objective.title}</td>
                <td className="description-cell">{objective.description || '-'}</td>
                <td className="actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(objective)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(objective.id)}
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

export default LearningObjectiveManager;
