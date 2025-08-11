import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

export default function Home() {
  const [shlok, setShlok] = useState('');
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShlok = async () => {
      try {
        const res = await axios.get('https://ritiks-insight-hub-nameverse.onrender.com/api/gita/daily-shlok');
        setShlok(res.data.shlok);
        setMeaning(res.data.meaning);
      } catch (err) {
        console.error(err);
        setShlok('Error fetching shlok');
        setMeaning('');
      } finally {
        setLoading(false);
      }
    };
    fetchShlok();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Bhagavad Gita Shlok of the Day Meaning ', 10, 20);
    doc.setFontSize(12);
    doc.text(meaning, 10, 60, { maxWidth: 180 });
    doc.save('BhagavadGitaShlok.pdf');
  };

  return (
    <div className="container text-center position-relative"
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 0,
    }}>
      <h3>Bhagavad Gita Shlok of the Day</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="marquee" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'serif' }}>{shlok}</div>
          <p><i>{meaning}</i></p>
        </>
      )}

      {/* Download button fixed at bottom-right */}
      <button
        onClick={downloadPDF}
        className="btn btn-primary"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          padding: '0',
          display: loading ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Download Shlok PDF"
      >
        ⬇️
      </button>
    </div>
  );
}
