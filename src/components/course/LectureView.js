// --------------------------------- LectureView.js ---------------------------------
// Responsible for rendering the video lecture content using an embeddable iframe
// Used inside CoursePage when selectedSection === 'lectures'
// ------------------------------------------------------------------------------------

import React from 'react';
import './styles/LectureView.css';

function LectureView({ lecture }) {
  if (!lecture) return null;

  let embedUrl = lecture.video_link;

  // ----- convert video to embeddable format if needed -----
  if (embedUrl.includes("youtube.com/watch?v=")) {
    embedUrl = embedUrl.replace("watch?v=", "embed/");
  } else if (embedUrl.includes("youtu.be/")) {
    embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
  }

  return (
    <div className="lecture-section">
      <div className="lecture-item">
        <strong>{lecture.lecture_title}</strong>
        <div className="lecture-video-container">
          <iframe
            className="responsive-iframe"
            src={embedUrl}
            title={lecture.lecture_title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default LectureView;
