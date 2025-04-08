/* ------------------------- CourseMenuBar.js -------------------------
Component responsible for 
  - displaying course title and navigation options (Home, Modules, Grades)
  - enabling dynamic dropdown navigation through course modules
  - allowing users to preview and select lectures and assignments
--------------------------------------------------------------------- */

import React, { useState } from 'react';
import './styles/CourseMenuBar.css';


/* ---------------------- Main CourseMenuBar Component ---------------------- */
function CourseMenuBar({
  course,
  modules,
  selectedModule,
  setSelectedModule,
  selectedSection,
  selectedAssignment,
  selectedLecture,
  setSelectedSection,
  onLectureClick,
  onAssignmentClick
}) {

  /* ----- state for toggling module dropdown and tracking hover state ----- */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredModule, setHoveredModule] = useState(null);


  /* ----- function to open/close dropdown menu ----- */
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);


  return (
    <div className="course-menu-bar-wrapper">

      {/* ------------------------ Top Navigation Bar ------------------------ */}
      <nav className="course-menu-bar d-flex align-items-center px-4 shadow-sm justify-content-start gap-4">
        
        {/* ------------------------ Course Title & Path ------------------------ */}
        <div className="d-flex flex-column justify-content-start">
          <h5 className="mb-0 fw-bold">{course?.course_title}</h5>
            <div className="w-100">
            {/* if module is selected, show full breadcrumb */}
            {selectedModule ? (
                <>
                Module {selectedModule.module_sequence} – {selectedModule.module_title}
                <span className="section-label">
                    {selectedSection === 'lectures' &&
                    (selectedLecture
                        ? ` - Lectures – ${selectedLecture.lecture_title}`
                        : ' - Lectures')}
                    {selectedSection === 'assignments' &&
                    (selectedAssignment
                        ? ` - Assignments – ${selectedAssignment.assignment_title}`
                        : ' - Assignments')}
                    {selectedSection === 'module' && ' - Module Overview'}
                </span>
                </>
            ) : (
                /* otherwise show section or default label */
                <span className="section-label">
                    {selectedSection === 'grades' ? 'Grades' : 'Course Home'}
                </span>
            )}
            </div>
        </div>

        {/* ------------------- Nav Buttons: Home / Modules / Grades ------------------- */}
        <div className="d-flex align-items-center gap-1 ms-4">

          {/* home button - resets selected module and section */}
          <div 
            className="nav-action home-button" 
            onClick={() => {
              setSelectedSection('home')
              setSelectedModule(null)}}
          >
            <span className="material-symbols-outlined icon-large">home</span>
            <h6 className="mb-0">Home</h6>
          </div>


          {/* modules button - toggles dropdown */}
          <div className="nav-action modules-button" onClick={toggleDropdown}>
            <span className="material-symbols-outlined icon-large">view_module</span>
            <h6 className="mb-0">Modules</h6>
          </div>

          {/* grades button - navigates to grades view */}
          <div className="nav-action grades-button" 
            onClick={() => {
              setSelectedSection('grades')
              setSelectedModule(null)}}
            >
            <span className="material-symbols-outlined icon-large">menu_book</span>
            <h6 className="mb-0">Grades</h6>
          </div>
        </div>
      </nav>

      {/* ------------------ Dropdown Panel for Modules ------------------ */}
      {dropdownOpen && (
        <div className="module-dropdown slide-in-from-top">

          {/* ------------------ Left Column: Module List ------------------ */}
          <div className="dropdown-col module-list">
            <div className="collapsible-header d-flex align-items-center px-2">
              <h6 className="mb-0">All Modules</h6>
            </div>

            {/* render all available modules */}
            {modules.map((mod) => (
              <div
                key={mod.id}
                className={`module-item ${hoveredModule?.id === mod.id ? 'active' : ''}`}
                onMouseEnter={() => setHoveredModule(mod)}
                onClick={() => {
                  setDropdownOpen(false);         // close dropdown
                  setSelectedModule(mod);         // select module
                  setSelectedSection('module');   // show module overview screen
                }}
              >
                Module {mod.module_sequence} – {mod.module_title}
              </div>
            ))}
          </div>

          {/* ------------------ Right Column: Preview Content ------------------ */}
          <div className="dropdown-col module-preview">

            {/* display lectures and assignments for hovered module */}
            {hoveredModule ? (
              <>
                <h6 className="mb-2 px-2">Lectures</h6>

                {/* show preview list of lectures */}
                {hoveredModule.lectures.map((lec) => (
                  <div
                    key={lec.lecture_id}
                    className="preview-item"
                    onClick={() => {
                      onLectureClick(lec, hoveredModule)
                      setDropdownOpen(false);
                    }}
                  >
                    {lec.lecture_title}
                  </div>
                ))}

                {/* show preview list of assignments */}
                <h6 className="mt-3 mb-2 px-2">Assignments</h6>
                {hoveredModule.assignments.map((asg) => (
                  <div
                    key={asg.assignment_id}
                    className="preview-item"
                    onClick={() => {
                      onAssignmentClick(asg, hoveredModule)
                      setDropdownOpen(false);
                    }}                    
                  >
                    {asg.assignment_title}
                  </div>
                ))}
              </>
            ) : (
              /* message when no module is hovered */
              <p className="text-muted">Hover over a module to preview its content.</p>
            )}
          </div>
        </div>
      )}

      {/* ------------------ Collapse Dropdown Button ------------------ */}
      {dropdownOpen && (
      <div className="collapse-dropdown-btn-wrapper">
          <button
            className="collapse-dropdown-btn"
            onClick={() => setDropdownOpen(false)}
          >
            <span className="material-symbols-outlined">expand_less</span>
          </button>
      </div>
      )}
    </div>
  );
}

export default CourseMenuBar;




