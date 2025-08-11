import React, { useState } from 'react';
import axios from 'axios';

export default function NameMeaning() {
  const [name, setName] = useState('');
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(false);

  const getMeaning = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const { data } = await axios.post('https://ritiks-insight-hub-nameverse.onrender.com/api/ai/meaning', { name });
      setMeaning(data.data.meaning);
    } catch (error) {
      console.error(error);
      setMeaning('Error fetching meaning.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light text-center">
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <h2 className="fw-bold mb-4">Discover the Meaning of Your Name</h2>
        <input
          className="form-control form-control-lg mb-3 shadow-sm"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <button
          className="btn btn-primary btn-lg fw-semibold px-4 shadow-sm"
          onClick={getMeaning}
          disabled={loading || !name}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Loading...
            </>
          ) : (
            'Get Meaning'
          )}
        </button>

        {meaning && !loading && (
          <p className="mt-4 fs-5 text-secondary">
            {meaning}
          </p>
        )}
      </div>
    </div>
  );
}
