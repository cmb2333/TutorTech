// --------------------------------- CourseHome.jsx ---------------------------------
// Responsible for rendering course introduction, module list, and expanded content.
// Used inside CoursePage when selectedSection === 'home'
// ----------------------------------------------------------------------------------

import React from 'react';

import './styles/CourseHome.css';
import './styles/Cards.css';


/* ----------------------------- Main Component ----------------------------- */
function CourseHome({
  course,
  modulesWithContent,
  isModuleExpanded,
  toggleModuleExpand,
  jumpToContentStep
}) {
  return (
    <div className="course-home-content" data-aos="fade-up">
      <h4 className="mb-3">Welcome to {course.course_title}</h4>

      <p><strong>Course Description:</strong></p>
      <p>{course.course_description || 'This course does not yet have a description.'}</p>

      {/* ------------------------ All Modules Section ------------------------ */}
      <div className="all-modules-view mt-4">
        <h5 className="mb-3">Course Modules</h5>

        {modulesWithContent.map((mod) => (
          <div key={mod.id} className="module-collapse-container mb-3">

            {/* ----- Toggle Header (always clickable) ----- */}
            <div className="d-flex justify-content-between align-items-center module-header"
                 onClick={() => toggleModuleExpand(mod.id)}
                 style={{ cursor: 'pointer' }}>
              <strong>
                Module {mod.module_sequence}: {mod.module_title}
                {!mod.unlocked && (
                  <span className="ms-2 badge bg-secondary">Locked</span>
                )}
              </strong>
              <span className="material-symbols-outlined">
                {isModuleExpanded(mod.id) ? 'expand_less' : 'expand_more'}
              </span>
            </div>

            {/* ----- Description ----- */}
            <p className="text-muted mt-1">{mod.module_description}</p>

            {/* ----- Expanded Content ----- */}
            {isModuleExpanded(mod.id) && (
              <div className="module-content mt-3">

                {/* ----- Lectures Section ----- */}
                <div className="mb-4">
                  <h6 className="text-primary d-flex align-items-center mb-2">
                    <span className="material-symbols-outlined me-2">import_contacts</span>
                    Lectures
                  </h6>
                  <div className="d-flex flex-wrap gap-3">
                    {mod.lectures.length > 0 ? (
                      mod.lectures.map((lec) => (
                        <div key={lec.lecture_id} className={`shadow-sm p-3 lecture-card ${!mod.unlocked ? 'locked-card' : ''}`} style={{ minWidth: '220px' }}>
                          <div className="d-flex flex-column">
                            <button
                              className="btn btn-link text-start text-decoration-none p-0"
                              onClick={() => mod.unlocked && jumpToContentStep('lecture', lec, mod)}
                              disabled={!mod.unlocked}
                            >
                              <h6 className="mb-0">
                                {lec.lecture_title}
                                {!mod.unlocked}
                              </h6>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No lectures yet.</p>
                    )}
                  </div>
                </div>

                {/* ----- Assignments Section ----- */}
                <div className="mb-2">
                  <h6 className="text-success d-flex align-items-center mb-2">
                    <span className="material-symbols-outlined me-2">assignment</span>
                    Assignments
                  </h6>
                  <div className="d-flex flex-wrap gap-3">
                    {mod.assignments.length > 0 ? (
                      mod.assignments.map((asg) => (
                        <div key={asg.assignment_id} className={`shadow-sm p-3 assignment-card ${!mod.unlocked ? 'locked-card' : ''}`} style={{ minWidth: '220px' }}>
                          <div className="d-flex flex-column">
                            <button
                              className="btn btn-link text-start text-decoration-none p-0"
                              onClick={() => mod.unlocked && jumpToContentStep('assignment', asg, mod)}
                              disabled={!mod.unlocked}
                            >
                              <h6 className="mb-0">
                                {asg.assignment_title}
                                {!mod.unlocked}
                              </h6>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No assignments yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


export default CourseHome;
