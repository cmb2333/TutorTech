/* ------------------------ CoursePage.js ------------------------
Component responsible for:
  - rendering full course experience for a given courseId
  - displaying lectures, assignments, grades, and module info
  - integrating with Chat component (AI tutor/mentor)
----------------------------------------------------------------- */

import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom'; // hook to access URL parameters (e.g., courseId)
import { useUser } from '../../context/UserContext'; // get the logged-in user

/* ----- content and layout components ----- */
import Assignment from '../Assignment';
import Chat from '../Chat';
import Grades from '../Grades';
import CourseMenuBar from './CourseMenuBar';
import CourseHome from './CourseHome';
import LectureView from './LectureView';
import ModuleOverview from './ModuleOverview';
import StepNavigator from './StepNavigator';


/* ----- logic hook for managing course content state ----- */
import { useCourseContent } from '../../hooks/useCourseContent';

/* ----- animation and styles ----- */
import AOS from 'aos';
import 'aos/dist/aos.css';
import './styles/CourseMenuBar.css';
import './styles/CoursePage.css';

/* ------------------------ Main CoursePage Component ------------------------ */
function CoursePage() {
  /* ------- Initialize AOS scroll animations -------- */
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

 /* ------------ Get user and courseId from route/context ------------ */
  const { courseId } = useParams();
  const { user } = useUser();
  const userId = user?.user_id || 'guest';

  /* ------------------------ Core course logic and UI state ------------------------ */
  const {
    course,
    modulesWithContent,
    selectedSection,
    selectedModule,
    selectedLecture,
    selectedAssignment,
    moduleLectures,
    moduleAssignments,
    prevStep,
    nextStep,
    goToNextStep,
    goToPrevStep,
    jumpToContentStep,
    toggleModuleExpand,
    isModuleExpanded,
    setSelectedModule,
    setSelectedSection,
    setSelectedAssignment,
    findModuleByAssignment
  } = useCourseContent(courseId, userId);

  /* ------------------------ Helper: Format previous/next step label ------------------------ */
  const formatStepLabel = (step) => {
    if (!step) return '';
    switch (step.type) {
      case 'module':
        return step.data?.module_sequence
          ? `Module ${step.data.module_sequence} – Overview`
          : 'Module Overview';
      case 'lecture':
        return `Lecture – ${step.data.lecture_title}`;
      case 'assignment':
        return `Assignment – ${step.data.assignment_title}`;
      default:
        return '';
    }
  };

  // formatted labels for StepNavigator UI
  const prevLabel = formatStepLabel(prevStep);
  const nextLabel = formatStepLabel(nextStep);

   /* ------------------------ AI Bot State and Prompt Triggering ------------------------ */
  const [botType, setBotType] = useState('Tutor');
  const [externalPrompt, setExternalPrompt] = useState('');

  const handleAskChatPrompt = (promptText) => {
    setExternalPrompt(promptText); // passes prompt into <Chat /> via prop
  };

  /* ------------------------ Dynamic Sidebar Height Logic ------------------------ */
  useEffect(() => {
    const updateSidebarHeight = () => {
      const sidebar = document.getElementById('botSidebar');
      if (!sidebar) return;

      // ----- constants for layout offsets -----
      const navbarHeight = 180;
      const footerHeight = 80;

      // ----- current scroll and screen info -----
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // ----- calculate available space at bottom and top -----
      const distanceFromBottom = documentHeight - (scrollY + windowHeight);
      const bottomOffset = distanceFromBottom < footerHeight ? footerHeight - distanceFromBottom : 0;
      const topOffset = scrollY < navbarHeight ? navbarHeight - scrollY : 0;

      // ----- compute final height based on available screen area -----
      const calculatedHeight = windowHeight - topOffset - bottomOffset;
      sidebar.style.maxHeight = `${calculatedHeight}px`;
    };

    updateSidebarHeight(); // run on mount

    // update height on scroll and resize
    window.addEventListener('scroll', updateSidebarHeight);
    window.addEventListener('resize', updateSidebarHeight);

    // cleanup listeners on unmount
    return () => {
      window.removeEventListener('scroll', updateSidebarHeight);
      window.removeEventListener('resize', updateSidebarHeight);
    };
  }, []);


  /* ------------------------ Component Render ------------------------ */
  return (
    <div className='course-page-wrapper'>
      {/* ------------------------ Course Menu Bar ------------------------ */}
      {course && (
        <CourseMenuBar
          course={course}
          modules={modulesWithContent}
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
          selectedSection={selectedSection}                    
          selectedAssignment={selectedAssignment}
          selectedLecture={selectedLecture} 
          setSelectedSection={setSelectedSection} 
          onLectureClick={(lec, mod) => {
            const targetMod = mod || modulesWithContent.find(m =>
              m.lectures.some(l => l.lecture_id === lec?.lecture_id)
            );
            jumpToContentStep('lecture', lec, targetMod); // ✅ always include mod
          }}
          onAssignmentClick={(asg, mod) => {
            const targetMod = mod || findModuleByAssignment(asg.assignment_id);
            jumpToContentStep('assignment', asg, targetMod); // ✅ always include mod
          }}
        />
      )}

      {/* ---------- Main Page Layout: Left (Course) + Right (Chat) ---------- */}
      <div className="course-page d-flex">

        {/* ---------- Left Section: Course Content ---------- */}
        <div className="course-info flex-grow-1 p-3" data-aos="slide-down" data-aos-delay="200">
          {course ? (
            <>
              {/* ---------- Section: Course Home ---------- */}
              {selectedSection === 'home' && course && (
                <CourseHome
                  course={course}
                  modulesWithContent={modulesWithContent}
                  isModuleExpanded={isModuleExpanded}
                  toggleModuleExpand={toggleModuleExpand}
                  jumpToContentStep={jumpToContentStep}
                />
              )}
              {/* ---------- Section: Module Overview ---------- */}
              {selectedSection === 'module' && selectedModule && (
                <ModuleOverview
                  selectedModule={selectedModule}
                  moduleLectures={moduleLectures}
                  moduleAssignments={moduleAssignments}
                  jumpToContentStep={jumpToContentStep}
                />
              )}
              {/* ---------- Section: Lectures ---------- */}
              {selectedSection === 'lecture' && selectedLecture && (
                <LectureView lecture={selectedLecture} />
              )}
              {/* ---------- Section: Assignments ---------- */}
              {selectedSection === 'assignment' && selectedAssignment && (
                // Display Assignment component when an assignment is selected
                <Assignment
                  assignment={{...selectedAssignment, course_code: course.course_code}}
                  userId={userId}
                  onAskChat={handleAskChatPrompt} 
                />
              )}
              {/* ---------- Section: Grades ---------- */}
              {selectedSection === 'grades' && (
                <>
                  <Grades
                    userId={userId}
                    filterCourse={course?.course_code}
                    onAssignmentSelect={(assignment) => {
                      const mod = findModuleByAssignment(assignment.assignment_id);
                    
                      // get the enriched version of the assignment from modulesWithContent
                      const enrichedAssignment = mod?.assignments.find(
                        (a) => a.assignment_id === assignment.assignment_id
                      );
                    
                      if (mod && enrichedAssignment) {
                        jumpToContentStep('assignment', enrichedAssignment, mod);
                      } else {
                        console.warn('Could not jump to assignment — module or data not found.');
                      }
                    }}
                    
                  />
                </>
              )}
              {/* ---------- Navigation arrows ---------- */}
              {['module', 'lecture', 'assignment'].includes(selectedSection) && (
                <StepNavigator
                  onPrev={goToPrevStep}
                  onNext={goToNextStep}
                  prevLabel={prevLabel}
                  nextLabel={nextLabel}
                  hasPrev={!!prevStep}
                  hasNext={!!nextLabel}
                />
              )}
            </>
          ) : (
            /*  ----- Show loading message while course data is being fetched ----- */
            <p>Loading course information...</p>
          )}
        </div>

        {/* ------------------ Right Section: AI Bot Sidebar ------------------ */}
        <div className="bot-section" id="botSidebar" data-aos="slide-left" data-aos-delay="200">
          
          {/* Dropdown to select the bot type */}
          <label className="bot-label">
            <span>Select AI Bot Type:</span>
            <select value={botType} onChange={(e) => setBotType(e.target.value)} className="bot-type-selector">
              <option value="Tutor">Tutor</option>
              <option value="Mentor">Mentor</option>
              <option value="Co-Learner">Co-Learner</option>
              <option value="Custom">My Learning Style</option>
            </select>
          </label>

          {/* Chat component */}
          <Chat 
            botType={botType} 
            courseId={courseId} 
            userId={user?.user_id} 
            externalPrompt={externalPrompt}
          />
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
