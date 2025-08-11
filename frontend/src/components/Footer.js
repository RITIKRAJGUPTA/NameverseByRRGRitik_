import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <small>© {new Date().getFullYear()} Ritik’s Insight Hub - NameVerse. All rights reserved.</small>
        <div>
          <Link to="/" className="text-light me-3 text-decoration-none">Home</Link>
          <Link to="/contact" className="text-light me-3 text-decoration-none">Contact</Link>
          <a href="https://ritik-portfolio-1.onrender.com/" target="_blank" rel="noreferrer" className="text-light text-decoration-none">Portfolio</a>
        </div>
      </div>
    </footer>
  );
}
