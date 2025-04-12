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
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesWithContent, setModulesWithContent] = useState([]);
  const [moduleUnlockStatus, setModuleUnlockStatus] = useState([]);

  /* ----- selected UI state ----- */
  const [selectedSection, setSelectedSection] = useState('home');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  /* ----- content of selected module ----- */
  const [moduleLectures, setModuleLectures] = useState([]);
  const [moduleAssignments, setModuleAssignments] = useState([]);

  /* ----- step-based navigation state ----- */
  const [moduleSteps, setModuleSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ----- UI expansion toggle state ----- */
  const [expandedModules, setExpandedModules] = useState([]);

  /* -------------------- Fetch course + modules -------------------- */
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
  }, [courseId]);

    /* ------------------------ Fetch unlocked modules ------------------------ */
    useEffect(() => {
      const fetchUnlockStatus = async () => {
        console.log("📡 Fetching module unlock status for", userId);
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${courseId}/modules/progress/${userId}`);
        const data = await res.json();
        if (res.ok) setModuleUnlockStatus(data);
      };
      fetchUnlockStatus();
    }, [courseId, userId]);

  /* ------------------------ Fetch lectures + assignments ------------------------ */
  useEffect(() => {
    if (modules.length > 0 && moduleUnlockStatus.length > 0) {
      buildModulesWithContent();
    }
  }, [modules, moduleUnlockStatus]);

  const buildModulesWithContent = async () => {
    const enriched = await Promise.all(modules.map(async (mod) => {
      const [lecRes, asgRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/modules/${mod.id}/lectures`),
        fetch(`${process.env.REACT_APP_API_URL}/modules/${mod.id}/assignments`)
      ]);
  
      const lectures = lecRes.ok ? (await lecRes.json()).sort((a, b) => a.sequence_number - b.sequence_number) : [];
      const assignments = asgRes.ok ? (await asgRes.json()).sort((a, b) => a.sequence_number - b.sequence_number) : [];
  
      const unlocked = moduleUnlockStatus.find((m) => m.module_id === mod.id)?.unlocked ?? false;
  
      return { ...mod, lectures, assignments, unlocked };
    }));
  
    setModulesWithContent(enriched);
    console.log("🧠 Enriched modules:", enriched);
  };
  

  /* ------------------------ Fetch + build steps for selected module ------------------------ */
  useEffect(() => {
    if (!selectedModule) return;

    if (skipAutoBuildRef.current) {
      skipAutoBuildRef.current = false;
      return;
    }

    const fetchModuleContent = async () => {
      if (!selectedModule) return;

      try {
        const [lecRes, asgRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/modules/${selectedModule.id}/lectures`),
          fetch(`${process.env.REACT_APP_API_URL}/modules/${selectedModule.id}/assignments`)
        ]);
        const lectures = lecRes.ok ? (await lecRes.json()).sort((a, b) => a.sequence_number - b.sequence_number) : [];
        const assignments = asgRes.ok ? (await asgRes.json()).sort((a, b) => a.sequence_number - b.sequence_number) : [];

        setModuleLectures(lectures);
        setModuleAssignments(assignments);

        const steps = [
          { type: 'module', data: selectedModule },
          ...lectures.map(lec => ({ type: 'lecture', data: lec })),
          ...assignments.map(asg => ({ type: 'assignment', data: asg }))
        ];

        setModuleSteps(steps);
        setCurrentIndex(0);
        setSelectedSection('module');
        setSelectedLecture(null);
        setSelectedAssignment(null);
      } catch (err) {
        console.error('Error loading module content:', err);
      }
    };

    fetchModuleContent();
  }, [selectedModule]);

  /* ------------------------ Determine prev/next steps ------------------------ */
  const isLastStep = currentIndex === moduleSteps.length - 1;

  const prevStep = currentIndex > 0
    ? moduleSteps[currentIndex - 1]
    : getFallbackPrevStep();

  const nextStep = !isLastStep
    ? moduleSteps[currentIndex + 1]
    : getFallbackNextStep();

  /* ------------------------ Fallback: next module start ------------------------ */
  function getFallbackNextStep() {
    const nextModuleIndex = modulesWithContent.findIndex(m => m.id === selectedModule?.id) + 1;
    return nextModuleIndex < modulesWithContent.length
      ? { type: 'module', data: modulesWithContent[nextModuleIndex] }
      : null;
  }

  /* ------------------------ Fallback: prev module last content ------------------------ */
  function getFallbackPrevStep() {
    const prevModuleIndex = modulesWithContent.findIndex(m => m.id === selectedModule?.id) - 1;
    if (prevModuleIndex < 0) return null;

    const mod = modulesWithContent[prevModuleIndex];
    const lastAssignment = [...mod.assignments].reverse()[0];
    const lastLecture = [...mod.lectures].reverse()[0];

    if (lastAssignment) return { type: 'assignment', data: lastAssignment };
    if (lastLecture) return { type: 'lecture', data: lastLecture };
    return { type: 'module', data: mod };
  }

  /* ------------------------ Step Navigation ------------------------ */
  const goToNextStep = () => {
    if (isLastStep) {
      const next = getFallbackNextStep();
  
      // block if next module is locked
      if (next && next.type === 'module' && !next.data.unlocked) {
        return; // do not allow navigation
      }
  
      if (next) {
        setSelectedModule(next.data);
      }
    } else {
      const next = moduleSteps[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      updateViewFromStep(next);
    }
  };

  const goToPrevStep = () => {
    if (!prevStep || !prevStep.data) return;
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      updateViewFromStep(moduleSteps[prevIndex]);
      return;
    }

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

    if (mod) jumpToContentStep(prevStep.type, prevStep.data, mod);
  };

  /* ------------------------ Update selected content view ------------------------ */
  const updateViewFromStep = (step) => {
    if (!step || !step.data) return;

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

    if (mod) setSelectedModule(mod);

    switch (step.type) {
      case 'module':
        setSelectedSection('module');
        setSelectedLecture(null);
        setSelectedAssignment(null);
        setModuleLectures(mod.lectures || []);
        setModuleAssignments(mod.assignments || []);
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

  /* ------------------------ Jump to specific step manually ------------------------ */
  const jumpToContentStep = (type, data, mod) => {
    if (!mod) return;

    skipAutoBuildRef.current = true;

    const steps = [
      { type: 'module', data: mod },
      ...mod.lectures.map(lec => ({ type: 'lecture', data: lec })),
      ...mod.assignments.map(asg => ({ type: 'assignment', data: asg }))
    ];

    const idKey = type === 'lecture' ? 'lecture_id' : 'assignment_id';
    const stepIndex = steps.findIndex(s => s.type === type && s.data?.[idKey] === data?.[idKey]);

    if (stepIndex >= 0) {
      setModuleSteps(steps);
      setCurrentIndex(stepIndex);
    }

    setSelectedModule(mod);
    setSelectedSection(type);
    if (type === 'lecture') setSelectedLecture(data);
    if (type === 'assignment') setSelectedAssignment(data);

    
    if (type === 'module') {
      setModuleLectures(mod.lectures || []);
      setModuleAssignments(mod.assignments || []);
    }
  };

  /* ------------------------ Expand/collapse module UI toggle ------------------------ */
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

  /* ------------------------ Expose data + methods to consumer ------------------------ */
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
    setSelectedAssignment,
    findModuleByAssignment
  };
}

