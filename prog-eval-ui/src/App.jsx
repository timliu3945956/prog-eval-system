import './App.css'
import { useState } from 'react'
import DegreeManager from './DegreeManager'
import CourseManager from './CourseManager'
import InstructorManager from './InstructorManager'
import SectionManager from './SectionManager'
import LearningObjectiveManager from './LearningObjectiveManager'
import CourseObjectiveMappingManager from './CourseObjectiveMappingManager'
import DegreeCourseMappingManager from './DegreeCourseMappingManager'
import EvaluationManager from './EvaluationManager'
import DegreeQuery from './DegreeQuery'
import CourseQuery from './CourseQuery'
import InstructorQuery from './InstructorQuery'
import EvaluationQuery from './EvaluationQuery'

function App() {
  const [activeTab, setActiveTab] = useState('evaluations')
  const [expandedCategory, setExpandedCategory] = useState({
    'data-entry': true,
    'mappings': false,
    'evaluations': true,
    'queries': false
  })

  const toggleCategory = (category) => {
    setExpandedCategory(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const menuCategories = [
    {
      id: 'data-entry',
      label: 'Data Entry',
      items: [
        { id: 'degrees', label: 'Degrees' },
        { id: 'courses', label: 'Courses' },
        { id: 'instructors', label: 'Instructors' },
        { id: 'sections', label: 'Sections' },
        { id: 'objectives', label: 'Learning Objectives' }
      ]
    },
    {
      id: 'mappings',
      label: 'Associations',
      items: [
        { id: 'degree-course', label: 'Degree-Course' },
        { id: 'mappings', label: 'Course-Objective' }
      ]
    },
    {
      id: 'evaluations',
      label: 'Evaluations',
      items: [
        { id: 'evaluations', label: 'Enter Evaluations' }
      ]
    },
    {
      id: 'queries',
      label: 'Queries',
      items: [
        { id: 'degree-query', label: 'Query by Degree' },
        { id: 'course-query', label: 'Query by Course' },
        { id: 'instructor-query', label: 'Query by Instructor' },
        { id: 'evaluation-query', label: 'Query by Evaluation' }
      ]
    }
  ]

  const renderContent = () => {
    switch(activeTab) {
      case 'degrees': return <DegreeManager />
      case 'courses': return <CourseManager />
      case 'instructors': return <InstructorManager />
      case 'sections': return <SectionManager />
      case 'objectives': return <LearningObjectiveManager />
      case 'mappings': return <CourseObjectiveMappingManager />
      case 'degree-course': return <DegreeCourseMappingManager />
      case 'evaluations': return <EvaluationManager />
      case 'degree-query': return <DegreeQuery />
      case 'course-query': return <CourseQuery />
      case 'instructor-query': return <InstructorQuery />
      case 'evaluation-query': return <EvaluationQuery />
      default: return <EvaluationManager />
    }
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Program Evaluation System</h1>
        </div>

        <div className="sidebar-content">
          {menuCategories.map(category => (
            <div key={category.id} className="menu-category">
              <button 
                className="category-header"
                onClick={() => toggleCategory(category.id)}
              >
                <span className="category-label">{category.label}</span>
                <span className={`category-toggle ${expandedCategory[category.id] ? 'open' : ''}`}>
                  ▼
                </span>
              </button>

              {expandedCategory[category.id] && (
                <div className="menu-items">
                  {category.items.map(item => (
                    <button
                      key={item.id}
                      className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <span className="item-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <p className="version">v1.0</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h2>{menuCategories.flatMap(c => c.items).find(i => i.id === activeTab)?.label || 'Program Evaluation'}</h2>
        </div>
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App
