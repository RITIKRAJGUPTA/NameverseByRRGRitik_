import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ adminLoggedIn, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Ritik’s Insight Hub - NameVerse</Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
          onClick={toggleNavbar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link" to="/name" onClick={() => setIsCollapsed(true)}>Name Meaning</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/game" onClick={() => setIsCollapsed(true)}>Game</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/ludo" onClick={() => setIsCollapsed(true)}>Ludo</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/search" onClick={() => setIsCollapsed(true)}>YouTube Search</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/contact" onClick={() => setIsCollapsed(true)}>Contact</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/gallery" onClick={() => setIsCollapsed(true)}>Photos</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/payment" onClick={() => setIsCollapsed(true)}>Support</Link></li>

            {!adminLoggedIn && (
              <li className="nav-item"><Link className="nav-link" to="/admin-login" onClick={() => setIsCollapsed(true)}>Admin Login</Link></li>
            )}
            {adminLoggedIn && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/admin-upload" onClick={() => setIsCollapsed(true)}>Upload Media</Link></li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={() => { onLogout(); setIsCollapsed(true); }}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
