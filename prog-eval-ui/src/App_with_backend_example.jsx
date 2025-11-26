import './App.css'
import { useState, useEffect } from 'react'

function App() {
  // State for mock data (replace with API calls)
  const [mockSections, setMockSections] = useState([
    { code: 'CS 5330', section: '101', term: 'Fall 2024', instructor: 'Dr. Chu', evalStatus: 'Complete', improvement: true },
    { code: 'CS 5330', section: '201', term: 'Fall 2024', instructor: 'Dr. Lee', evalStatus: 'Partial', improvement: false },
    { code: 'CS 6120', section: '110', term: 'Summer 2024', instructor: 'Dr. Smith', evalStatus: 'Missing', improvement: false },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // API Base URL
  const API_URL = 'http://localhost:8080/api'

  // Example: Fetch degrees from backend
  const fetchDegreesFromBackend = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/degrees`)
      if (!response.ok) throw new Error('Failed to fetch degrees')
      const degrees = await response.json()
      console.log('Degrees from backend:', degrees)
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Example: Create a new degree
  const createDegree = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/degrees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Master of Science in Computer Science',
          level: 'MS',
          coreObjectives: 'LO-1, LO-2'
        })
      })
      if (!response.ok) throw new Error('Failed to create degree')
      const newDegree = await response.json()
      console.log('Created degree:', newDegree)
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const evalLegend = {
    Complete: 'status-complete',
    Partial: 'status-partial',
    Missing: 'status-missing',
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__text">
          <p className="eyebrow">CS 5330 · Program Evaluation</p>
          <h1>Program Evaluation Console</h1>
          <p className="muted">
            Capture degree metadata, map objectives to core courses, and track instructor evaluations before sending
            everything to MySQL.
          </p>
          <div className="hero__actions">
            {/* Backend Test Buttons */}
            <button className="btn btn-primary" onClick={fetchDegreesFromBackend} disabled={loading}>
              {loading ? 'Loading...' : 'Test Backend Connection'}
            </button>
            <button className="btn btn-ghost" onClick={createDegree} disabled={loading}>
              {loading ? 'Creating...' : 'Create Sample Degree'}
            </button>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat">
            <span className="stat__label">Active Degrees</span>
            <span className="stat__value">6</span>
            <span className="stat__hint">BA, BS, MS, PhD, Cert</span>
          </div>
          <div className="stat">
            <span className="stat__label">Objectives Tracked</span>
            <span className="stat__value">28</span>
            <span className="stat__hint">Linked to 14 core courses</span>
          </div>
          <div className="stat">
            <span className="stat__label">Pending Evaluations</span>
            <span className="stat__value">9</span>
            <span className="stat__hint">Fall 2024 snapshot</span>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Data entry</p>
              <h2>Degree & Course Setup</h2>
              <p className="muted">Define the building blocks before you collect evaluations.</p>
            </div>
            <span className="badge">Step 1</span>
          </div>
          <div className="form-grid">
            <div className="card">
              <div className="card__header">
                <h3>Degree</h3>
                <p className="muted">Name, level, and primary objectives.</p>
              </div>
              <div className="form">
                <label>
                  Degree name
                  <input type="text" placeholder="e.g., Computer Science" />
                </label>
                <label>
                  Level
                  <select>
                    <option>BA</option>
                    <option>BS</option>
                    <option>MS</option>
                    <option>Ph.D.</option>
                    <option>Cert</option>
                  </select>
                </label>
                <label>
                  Core objectives
                  <input type="text" placeholder="Enter codes separated by commas" />
                </label>
                <button className="btn btn-primary">Save degree</button>
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <h3>Course</h3>
                <p className="muted">Assign courses and tag core requirements.</p>
              </div>
              <div className="form">
                <label>
                  Course number
                  <input type="text" placeholder="CS 5330" />
                </label>
                <label>
                  Course title
                  <input type="text" placeholder="Program Evaluation" />
                </label>
                <label className="inline">
                  <input type="checkbox" />
                  Core course for this degree
                </label>
                <button className="btn btn-primary">Add course</button>
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <h3>Instructor</h3>
                <p className="muted">Capture instructor IDs for section assignment.</p>
              </div>
              <div className="form">
                <label>
                  Instructor ID
                  <input type="text" placeholder="e.g., 000123" />
                </label>
                <label>
                  Instructor name
                  <input type="text" placeholder="Dr. Jane Doe" />
                </label>
                <button className="btn btn-secondary">Add instructor</button>
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <h3>Section</h3>
                <p className="muted">Term, section number, and enrollment totals.</p>
              </div>
              <div className="form">
                <label>
                  Semester
                  <input type="text" placeholder="Fall 2024" />
                </label>
                <label>
                  Section number
                  <input type="text" placeholder="101" />
                </label>
                <label>
                  Enrollment
                  <input type="number" placeholder="45" />
                </label>
                <button className="btn btn-secondary">Add section</button>
              </div>
            </div>

            <div className="card full">
              <div className="card__header">
                <h3>Learning Objective</h3>
                <p className="muted">Create objectives and map them to core courses.</p>
              </div>
              <div className="form form-inline">
                <label>
                  Code
                  <input type="text" placeholder="LO-1" />
                </label>
                <label>
                  Title
                  <input type="text" placeholder="Students can design relational schemas" />
                </label>
                <label>
                  Description
                  <textarea rows="3" placeholder="Briefly describe the outcome and what success looks like." />
                </label>
                <label>
                  Courses mapped
                  <input type="text" placeholder="CS 5330 (core), CS 6120" />
                </label>
                <button className="btn btn-primary">Save objective</button>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Evaluation entry</p>
              <h2>Collect Instructor Submissions</h2>
              <p className="muted">Ask for degree, semester, instructor, then capture objectives per section.</p>
            </div>
            <span className="badge">Step 2</span>
          </div>
          <div className="card full">
            <div className="form form-inline">
              <label>
                Degree
                <select>
                  <option>MS · Computer Science</option>
                  <option>BS · Computer Science</option>
                  <option>Cert · Data Science</option>
                </select>
              </label>
              <label>
                Semester
                <select>
                  <option>Fall 2024</option>
                  <option>Summer 2024</option>
                  <option>Spring 2024</option>
                </select>
              </label>
              <label>
                Instructor
                <input type="text" placeholder="Search by name or ID" />
              </label>
              <button className="btn btn-primary">Fetch sections</button>
            </div>
          </div>

          <div className="card full">
            <div className="card__header">
              <h3>Sections & objectives</h3>
              <p className="muted">Status indicates whether evaluation data and improvement notes exist.</p>
            </div>
            <div className="table">
              <div className="table__head">
                <span>Course</span>
                <span>Section</span>
                <span>Term</span>
                <span>Instructor</span>
                <span>Status</span>
                <span>Improvement note</span>
              </div>
              {mockSections.map((row) => (
                <div className="table__row" key={`${row.code}-${row.section}`}>
                  <span>{row.code}</span>
                  <span>{row.section}</span>
                  <span>{row.term}</span>
                  <span>{row.instructor}</span>
                  <span className={`pill ${evalLegend[row.evalStatus]}`}>{row.evalStatus}</span>
                  <span>{row.improvement ? 'Entered' : 'Missing'}</span>
                </div>
              ))}
            </div>
            <div className="table__actions">
              <button className="btn btn-secondary">Duplicate degree evaluation</button>
              <button className="btn btn-primary">Open evaluator</button>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Queries</p>
              <h2>Program & Evaluation Reports</h2>
              <p className="muted">Preview the queries you'll wire to MySQL endpoints.</p>
            </div>
            <span className="badge">Step 3</span>
          </div>

          <div className="query-grid">
            <div className="card">
              <div className="card__header">
                <h3>Degree overview</h3>
                <p className="muted">Courses, core flags, objectives, sections by time range.</p>
              </div>
              <div className="form">
                <label>
                  Degree
                  <select>
                    <option>MS · Computer Science</option>
                    <option>BS · Computer Science</option>
                  </select>
                </label>
                <label>
                  Semester range
                  <input type="text" placeholder="e.g., Spring 2023 - Fall 2024" />
                </label>
                <button className="btn btn-secondary">List degree data</button>
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <h3>Course sections</h3>
                <p className="muted">All sections for a course within selected semesters.</p>
              </div>
              <div className="form">
                <label>
                  Course number
                  <input type="text" placeholder="CS 5330" />
                </label>
                <label>
                  Semester range
                  <input type="text" placeholder="Summer 2023 - Fall 2024" />
                </label>
                <button className="btn btn-secondary">List sections</button>
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <h3>Instructor history</h3>
                <p className="muted">Sections taught by instructor across semesters.</p>
              </div>
              <div className="form">
                <label>
                  Instructor
                  <input type="text" placeholder="Enter ID or name" />
                </label>
                <label>
                  Semester range
                  <input type="text" placeholder="Spring 2023 - Fall 2024" />
                </label>
                <button className="btn btn-secondary">List instructor sections</button>
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <h3>Evaluation completeness</h3>
                <p className="muted">Track missing or partial evaluation entries.</p>
              </div>
              <div className="form">
                <label>
                  Semester
                  <select>
                    <option>Fall 2024</option>
                    <option>Summer 2024</option>
                    <option>Spring 2024</option>
                  </select>
                </label>
                <label>
                  Success threshold
                  <input type="number" placeholder="e.g., 80 for 80% non-F grades" />
                </label>
                <button className="btn btn-primary">Run evaluation query</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
