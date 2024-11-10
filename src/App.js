import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import About from './components/About';
import Team from './components/Team';
import Sponsors from './components/Sponsors';
import Technologies from './components/Technologies';
import Solution from './components/Solution';
import Schedule from './components/Schedule';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Banner />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/technologies" element={<Technologies />} />
          <Route path="/solution" element={<Solution />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;




