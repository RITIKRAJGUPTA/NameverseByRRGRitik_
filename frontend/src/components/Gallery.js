import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get('https://ritiks-insight-hub-nameverse.onrender.com/api/gallery/photos');
        if (res.data.success) {
          setImages(res.data.images);
        } else {
          setError('Failed to load images');
        }
      } catch (err) {
        setError('Error fetching images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading gallery...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

  return (
    <div className="container mt-5 pt-5">
      <h3 className="mb-4 text-center">Gallery</h3>
      <div className="row">
        {images.map((url, i) => (
          <div key={i} className="col-6 col-md-3 mb-3">
            {url.match(/\.(mp4|mov)$/i) ? (
              <video
                src={url}
                controls
                className="img-fluid rounded"
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              />
            ) : (
              <img
                src={url}
                alt={`upload-${i}`}
                className="img-fluid rounded"
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
