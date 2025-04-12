// --------------------------- StepNavigator.js ---------------------------
// Renders navigation buttons (Prev / Next) between module steps
// Used by CoursePage to allow seamless progression through content
// ------------------------------------------------------------------------

import React from 'react';
import './styles/StepNavigator.css';

function StepNavigator({ onPrev, onNext, prevLabel, nextLabel, hasPrev, hasNext }) {
  return (
    <div className="d-flex justify-content-between align-items-center px-2">
      <button
        className="main-content-prev-button shadow-sm"
        onClick={onPrev}
        disabled={!hasPrev}
        title={prevLabel || ''}
      >
        <span className="material-symbols-outlined align-middle me-1">arrow_back</span>
      </button>

      <button
        className="main-content-next-button shadow-sm"
        onClick={onNext}
        disabled={!hasNext}
        title={nextLabel || ''}
      >
        <span className="material-symbols-outlined align-middle ms-1">arrow_forward</span>
      </button>
    </div>
  );
}

export default StepNavigator;
