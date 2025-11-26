import { useState, useEffect } from 'react'
import './DegreeManager.css'

function DegreeManager() {
  const [degrees, setDegrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    level: 'BS'
  })

  // Fetch degrees from API
  const fetchDegrees = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/degrees')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setDegrees(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch degrees:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load degrees on mount
  useEffect(() => {
    fetchDegrees()
  }, [])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.level) {
      return
    }

    try {
      const url = editingId 
        ? `http://localhost:8080/api/degrees/${editingId}`
        : 'http://localhost:8080/api/degrees'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      await fetchDegrees()
      resetForm()
    } catch (err) {
      console.error('Failed to save degree:', err)
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this degree?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/degrees/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      await fetchDegrees()
    } catch (err) {
      console.error('Failed to delete degree:', err)
    }
  }

  // Handle edit
  const handleEdit = (degree) => {
    setFormData({
      name: degree.name,
      level: degree.level
    })
    setEditingId(degree.id)
    setShowForm(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      level: 'BS'
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="degree-manager">
      <div className="degree-manager__header">
        <h2>Degree Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Degree'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="degree-form">
          <h3>{editingId ? 'Edit Degree' : 'Add New Degree'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Degree Name *
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Master of Science in Computer Science"
                  required
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Level *
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="BA">BA</option>
                  <option value="BS">BS</option>
                  <option value="MS">MS</option>
                  <option value="PhD">Ph.D.</option>
                  <option value="Cert">Certificate</option>
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Degrees Table */}
      <div className="degree-table">
        {loading ? (
          <p>Loading degrees...</p>
        ) : degrees.length === 0 ? (
          <p>No degrees found. Create one to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {degrees.map(degree => (
                <tr key={degree.id}>
                  <td>{degree.id}</td>
                  <td>{degree.name}</td>
                  <td>
                    <span className="badge">{degree.level}</span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => handleEdit(degree)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(degree.id)}
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
    </div>
  )
}

export default DegreeManager
