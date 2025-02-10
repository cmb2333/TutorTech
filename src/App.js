import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Chat from './components/Chat';
import Courses from './components/Courses';
import Signup from './components/Signup';
import CoursePage from './components/CoursePage';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

import './styles.css';  


function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/courses" element={<Courses />} />

          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;




