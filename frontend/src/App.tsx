import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import IssuancePage from './pages/IssuancePage';
import VerificationPage from './pages/VerificationPage';
import './App.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>🔐 Kube Credential</h2>
          <p>Secure Credential Management System</p>
        </div>
        <div className="nav-links">
          <Link 
            to="/issue" 
            className={`nav-link ${location.pathname === '/issue' ? 'active' : ''}`}
          >
            Issue Credential
          </Link>
          <Link 
            to="/verify" 
            className={`nav-link ${location.pathname === '/verify' ? 'active' : ''}`}
          >
            Verify Credential
          </Link>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<IssuancePage />} />
            <Route path="/issue" element={<IssuancePage />} />
            <Route path="/verify" element={<VerificationPage />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>© 2024 Kube Credential System | Built with React, TypeScript & Kubernetes</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;