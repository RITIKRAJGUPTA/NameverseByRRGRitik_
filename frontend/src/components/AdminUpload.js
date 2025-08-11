import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminUpload({ token, onLogout }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) return setMessage('Please select a file first');

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await axios.post('https://ritiks-insight-hub-nameverse.onrender.com/api/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        }
      });
      if (res.data.success) {
        setMessage('File uploaded successfully!');
        setFile(null);
      } else {
        setMessage('Upload failed');
      }
    } catch (err) {
      setMessage('Upload error');
    }
  };

  const handleLogout = async () => {
  setMessage('');  // Clear any old message
  try {
    await axios.post('https://ritiks-insight-hub-nameverse.onrender.com/api/admin/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    onLogout();
    

    toast.success('User logged out successfully', {
      position: 'top-center',
      autoClose: 3000,
      onClose: () => navigate('/admin-login'),
    });
    localStorage.removeItem('adminToken');
  } catch (err) {
    setMessage('Logout failed');
  }
};


  return (
    <div className="container mt-5 pt-5" style={{ maxWidth: '500px', position: 'relative' }}>
      {/* Logout button at top-right below navbar */}
      <button
        onClick={handleLogout}
        className="btn btn-danger"
        style={{ position: 'fixed', top: '70px', right: '20px', zIndex: 1050 }}
      >
        Logout
      </button>

      <h3>Upload Photos/Videos</h3>
      <input type="file" accept="image/*,video/*" className="form-control mb-3" onChange={handleFileChange} />
      <button onClick={handleUpload} className="btn btn-success mb-3">Upload</button>

      {message && (
        <p className="mt-3" style={{ color: message.includes('successfully') ? 'green' : 'red' }}>
          {message}
        </p>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
