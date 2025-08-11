import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', number: '', message: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await axios.post('https://ritiks-insight-hub-nameverse.onrender.com/api/contact/submit', form);
      toast.success('✅ Message sent successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setForm({ name: '', email: '', number: '', message: '' });
    } catch (err) {
      toast.error('❌ Failed to send message.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="container mt-5 pt-5">
      <ToastContainer />
      <h2>Contact Me</h2>
      <input
        className="form-control mb-2"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
      />
      <input
        className="form-control mb-2"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />
      <input
        className="form-control mb-2"
        name="number"
        placeholder="Phone Number"
        value={form.number}
        onChange={handleChange}
      />
      <textarea
        className="form-control mb-2"
        name="message"
        placeholder="Message"
        value={form.message}
        onChange={handleChange}
      ></textarea>
      <button className="btn btn-success" onClick={handleSubmit}>Send</button>
    </div>
  );
}
