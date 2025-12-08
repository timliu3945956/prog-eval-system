import { useState, useEffect } from 'react'
import './CourseManager.css'

function CourseManager() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    courseNumber: '',
    title: '',
    description: ''
  })

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/courses')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setCourses(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch courses:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load courses on mount
  useEffect(() => {
    fetchCourses()
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
    
    if (!formData.courseNumber || !formData.title) {
      return
    }

    try {
      const url = editingId 
        ? `http://localhost:8080/api/courses/${editingId}`
        : 'http://localhost:8080/api/courses'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      await fetchCourses()
      resetForm()
    } catch (err) {
      console.error('Failed to save course:', err)
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/courses/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(`Cannot delete course: ${errorData.message}`)
        return
      }

      await fetchCourses()
    } catch (err) {
      console.error('Failed to delete course:', err)
      alert('Error deleting course. Please try again.')
    }
  }

  // Handle edit
  const handleEdit = (course) => {
    setFormData({
      courseNumber: course.courseNumber,
      title: course.title,
      description: course.description || ''
    })
    setEditingId(course.id)
    setShowForm(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      courseNumber: '',
      title: '',
      description: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="course-manager">
      <div className="course-manager__header">
        <h2>Course Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Course'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="course-form">
          <h3>{editingId ? 'Edit Course' : 'Add New Course'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Course Number *
                <input
                  type="text"
                  name="courseNumber"
                  value={formData.courseNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., CS 5330"
                  required
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Title *
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Program Evaluation"
                  required
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Description
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the course"
                  rows="4"
                />
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

      {/* Courses Table */}
      <div className="course-table">
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses found. Create one to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course Number</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>
                    <span className="badge">{course.courseNumber}</span>
                  </td>
                  <td>{course.title}</td>
                  <td className="description">{course.description || '-'}</td>
                  <td className="actions">
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => handleEdit(course)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(course.id)}
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

export default CourseManager
