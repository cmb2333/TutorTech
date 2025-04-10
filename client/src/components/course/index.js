/* ------------------------ index.js (Course Components) ------------------------
Barrel file used to simplify and centralize exports for all course-related 
components. This allows cleaner imports elsewhere in the app, so instead of:

    import CoursePage from './components/course/CoursePage';

You can write:

    import { CoursePage } from './components/course';

This file exports:
  - CoursePage: main layout for viewing a course
  - CourseMenuBar: navbar inside a course
  - CourseHome: landing view for a course
  - ModuleOverview: overview of a specific module
  - LectureView: display for individual lecture content
  - StepNavigator: navigation controls between course content steps
------------------------------------------------------------------------------- */
export { default as CoursePage } from './CoursePage';
export { default as CourseMenuBar } from './CourseMenuBar';
export { default as CourseHome } from './CourseHome';
export { default as ModuleOverview } from './ModuleOverview';
export { default as LectureView } from './LectureView';
export { default as StepNavigator } from './StepNavigator';