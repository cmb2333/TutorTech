// --------------------------------- ModuleOverview.js ---------------------------------
// Displays a module’s overview including its description, lectures, and assignments.
// Triggered when selectedSection === 'module'
// --------------------------------------------------------------------------------------

import React from 'react';
import './styles/ModuleOverview.css'; // contains container styling
import './styles/Cards.css'; // ✅ shared card layout styling

function ModuleOverview({ 
  selectedModule, 
  moduleLectures, 
  moduleAssignments, 
  jumpToContentStep 
}) {
  return (
    <div className="module-overview">
      <h3>
        Module {selectedModule.module_sequence} – {selectedModule.module_title}
      </h3>
      <p className="text-muted">{selectedModule.module_description}</p>

      {/* ------------------------ Lectures ------------------------ */}
      <div className="mb-4">
        <h6 className="text-primary d-flex align-items-center mb-2">
          <span className="material-symbols-outlined me-2">import_contacts</span>
          Lectures
        </h6>

        <div className="d-flex flex-wrap gap-3">
          {moduleLectures.length > 0 ? (
            moduleLectures.map((lec) => (
              <div key={lec.lecture_id} className="card shadow-sm p-3 lecture-card" style={{ minWidth: '220px' }}>
                <div className="d-flex flex-column">
                  <button
                    className="btn btn-link text-start text-decoration-none p-0"
                    onClick={() => jumpToContentStep('lecture', lec, selectedModule)}
                  >
                    <h6 className="mb-0">{lec.lecture_title}</h6>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No lectures available.</p>
          )}
        </div>
      </div>

      {/* ------------------------ Assignments ------------------------ */}
      <div className="mb-2">
        <h6 className="text-success d-flex align-items-center mb-2">
          <span className="material-symbols-outlined me-2">assignment</span>
          Assignments
        </h6>

        <div className="d-flex flex-wrap gap-3">
          {moduleAssignments.length > 0 ? (
            moduleAssignments.map((asg) => (
              <div key={asg.assignment_id} className="card shadow-sm p-3 assignment-card" style={{ minWidth: '220px' }}>
                <div className="d-flex flex-column">
                  <button
                    className="btn btn-link text-start text-decoration-none p-0"
                    onClick={() => jumpToContentStep('assignment', asg, selectedModule)}
                  >
                    <h6 className="mb-0">{asg.assignment_title}</h6>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No assignments available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModuleOverview;

