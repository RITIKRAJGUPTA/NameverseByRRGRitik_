import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://ritiks-insight-hub-nameverse.onrender.com/api/admin/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        onLogin(res.data.token);
        toast.success('User logged in successfully!', {
          position: 'top-center',
          autoClose: 3000,
          onClose: () => navigate('/admin-upload'), // Redirect after toast closes
        });
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="container mt-5 pt-5" style={{ maxWidth: '400px' }}>
      <h3>Admin Login</h3>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-3"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-danger">{error}</p>}
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
