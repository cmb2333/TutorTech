/* ------------------------ useCourseContent.js ------------------------
Custom React hook used by CoursePage to manage:
  - course and module content loading
  - navigation through lectures, assignments, and module overviews
  - UI state like expanded dropdowns and active selections
----------------------------------------------------------------------- */

import { useEffect, useRef, useState } from 'react';

/* ------------------------ Main Hook Definition ------------------------ */
export function useCourseContent(courseId, userId) {

  const skipAutoBuildRef = useRef(false); // prevents auto build when manually jumping to step

  /* ----- core course/module state ----- */
  const [course, setCourse] = useState(null); // full course object
  const [modules, setModules] = useState([]); // list of module metadata
  const [modulesWithContent, setModulesWithContent] = useState([]); // modules w/ lectures + assignments
  

  /* ----- selected UI state: what user is currently viewing ----- */
  const [selectedSection, setSelectedSection] = useState('home'); // 'home' | 'module' | 'lecture' | 'assignment'
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  /* ----- current module's fetched content (lectures/assignments) ----- */
  const [moduleLectures, setModuleLectures] = useState([]);
  const [moduleAssignments, setModuleAssignments] = useState([]);

  /* ----- navigation: ordered steps and current index ----- */
  const [moduleSteps, setModuleSteps] = useState([]); // all steps for current module
  const [currentIndex, setCurrentIndex] = useState(0); // index within moduleSteps

  /* ----- UI dropdown state: which modules are expanded in the list view ----- */
  const [expandedModules, setExpandedModules] = useState([]); 

  /* -------------------- Fetch course + module metadata -------------------- */
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${courseId}`);
        const data = await res.json();
        if (res.ok) setCourse(data);
        else console.error('Course fetch failed:', data.message);
      } catch (err) {
        console.error('Error fetching course:', err);
      }
    };

    const fetchModules = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${courseId}/modules`);
        const data = await res.json();
        if (res.ok && data.length > 0) setModules(data);
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };

    fetchCourse();
    fetchModules();
  }, [courseId]); // run effect when courseId changes

  /* ------------------------ Enrich modules w/ content ------------------------ */
  useEffect(() => {
    if (modules.length > 0) buildModulesWithContent();
  }, [modules]); // run when module list updates

  /* ------------------------ Fetch lectures + assignments per module ------------------------ */
  const buildModulesWithContent = async () => {
    const enriched = await Promise.all(modules.map(async (mod) => {
      const [lecRes, asgRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/modules/${mod.id}/lectures`),
        fetch(`${process.env.REACT_APP_API_URL}/modules/${mod.id}/assignments`)
      ]);
      const lectures = await lecRes.json();
      const assignments = await asgRes.json();
      return { ...mod, lectures, assignments };
    }));
    setModulesWithContent(enriched);
  };

  /* ------------------------ Build module steps when selected ------------------------ */
  useEffect(() => {

    if (skipAutoBuildRef.current) {
      skipAutoBuildRef.current = false;
      return; // skip auto build if jumping manually
    }

    console.log('⏳ Fetching module content and building steps');

    const fetchModuleContent = async () => {
      if (!selectedModule) return;

      try {
        const [lecRes, asgRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/modules/${selectedModule.id}/lectures`),
          fetch(`${process.env.REACT_APP_API_URL}/modules/${selectedModule.id}/assignments`)
        ]);
        const lectures = await lecRes.json();
        const assignments = await asgRes.json();

        if (lecRes.ok) setModuleLectures(lectures);
        if (asgRes.ok) setModuleAssignments(assignments);

        // build navigation steps: module home -> lectures -> assignments
        const steps = [
          { type: 'module', data: selectedModule },
          ...lectures.map(lec => ({ type: 'lecture', data: lec })),
          ...assignments.map(asg => ({ type: 'assignment', data: asg }))
        ];

        setModuleSteps(steps); // set steps for navigation
        setCurrentIndex(0); // reset to beginning
        setSelectedSection('module');
        setSelectedLecture(null);
        setSelectedAssignment(null);
      } catch (err) {
        console.error('Error loading module content:', err);
      }
    };

    fetchModuleContent();
  }, [selectedModule]); // re-run when selected module changes

  /* ------------------------ Determine prev/next step ------------------------ */
  const isLastStep = currentIndex === moduleSteps.length - 1;

  const prevStep = currentIndex > 0
    ? moduleSteps[currentIndex - 1]
    : getFallbackPrevStep();

  const nextStep = !isLastStep
    ? moduleSteps[currentIndex + 1]
    : getFallbackNextStep();

  /* ------------------------ Fallback to first step of next module ------------------------ */
  function getFallbackNextStep() {
    const nextModuleIndex = modulesWithContent.findIndex(m => m.id === selectedModule?.id) + 1;
    return nextModuleIndex < modulesWithContent.length
      ? { type: 'module', data: modulesWithContent[nextModuleIndex] }
      : null;
  }

  /* ------------------------ Fallback to last step of previous module ------------------------ */
  function getFallbackPrevStep() {
    const prevModuleIndex = modulesWithContent.findIndex(m => m.id === selectedModule?.id) - 1;
    if (prevModuleIndex < 0) return null;

    // get prev mod and last assignment/lecture
    const mod = modulesWithContent[prevModuleIndex];
    const lastAssignment = [...mod.assignments].reverse()[0];
    const lastLecture = [...mod.lectures].reverse()[0];

    // return the last content or just the module overview
    if (lastAssignment) return { type: 'assignment', data: lastAssignment };
    if (lastLecture) return { type: 'lecture', data: lastLecture };
    return { type: 'module', data: mod };
  }

  /* ------------------------ Navigate to next step ------------------------ */
  const goToNextStep = () => {
    if (isLastStep) {
      const next = getFallbackNextStep();
      if (next) setSelectedModule(next.data);
    } else {
      const next = moduleSteps[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      updateViewFromStep(next);
    }
  };

  /* ------------------------ Navigate to previous step ------------------------ */
  const goToPrevStep = () => {
    if (!prevStep || !prevStep.data) return;
  
    const prevIndex = currentIndex - 1;
  
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      updateViewFromStep(moduleSteps[prevIndex]);
      return;
    }
  
    // fallback: build from previous module
    const mod = modulesWithContent.find(m => {
      if (prevStep.type === 'lecture') {
        return m.lectures.some(l => l.lecture_id === prevStep.data.lecture_id);
      }
      if (prevStep.type === 'assignment') {
        return m.assignments.some(a => a.assignment_id === prevStep.data.assignment_id);
      }
      if (prevStep.type === 'module') {
        return m.id === prevStep.data.id;
      }
      return false;
    });
  
    if (mod) {
      jumpToContentStep(prevStep.type, prevStep.data, mod);
    }
  };
  

  /* ------------------------ Update selected view state ------------------------ */
  const updateViewFromStep = (step) => {
    if (!step || !step.data) return;
  
    // find the module this step belongs to (from modulesWithContent)
    const mod = modulesWithContent.find(m => {
      if (step.type === 'lecture') {
        return m.lectures.some(l => l.lecture_id === step.data.lecture_id);
      }
      if (step.type === 'assignment') {
        return m.assignments.some(a => a.assignment_id === step.data.assignment_id);
      }
      if (step.type === 'module') {
        return m.id === step.data.id;
      }
      return false;
    });
  
    if (mod) setSelectedModule(mod); // sync the active module
  
    switch (step.type) {
      case 'module':
        setSelectedSection('module');
        setSelectedLecture(null);
        setSelectedAssignment(null);
        break;
      case 'lecture':
        setSelectedSection('lecture');
        setSelectedLecture(step.data);
        break;
      case 'assignment':
        setSelectedSection('assignment');
        setSelectedAssignment(step.data);
        break;
    }
  };
  

  /* ------------------------ Jump directly to a specific step ------------------------ */
  const jumpToContentStep = (type, data, mod) => {
    if (!mod) return;
  
    skipAutoBuildRef.current = true;
  
    const steps = [
      { type: 'module', data: mod },
      ...mod.lectures.map(lec => ({ type: 'lecture', data: lec })),
      ...mod.assignments.map(asg => ({ type: 'assignment', data: asg }))
    ];
  
    const idKey = type === 'lecture' ? 'lecture_id' : 'assignment_id'; // match by correct ID
    const stepIndex = steps.findIndex(s => s.type === type && s.data?.[idKey] === data?.[idKey]);
  
    if (stepIndex >= 0) {
      setModuleSteps(steps);
      setCurrentIndex(stepIndex);
    }
  
    setSelectedModule(mod);
    setSelectedSection(type);
    if (type === 'lecture') setSelectedLecture(data);
    if (type === 'assignment') setSelectedAssignment(data);
  };
  
  
  /* ------------------------ Toggle module expansion UI ------------------------ */
  const toggleModuleExpand = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isModuleExpanded = (moduleId) => expandedModules.includes(moduleId);

  const findModuleByAssignment = (assignmentId) => {
    return modulesWithContent.find(mod =>
      mod.assignments.some(asg => asg.assignment_id === assignmentId)
    );
  };

  /* ------------------------ Expose values and actions to consuming component ------------------------ */
  return {
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
    findModuleByAssignment
  };
}
