import React, { useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";

export default function YoutubeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchYouTube = async (searchTerm) => {
    if (!searchTerm) return;
    try {
      const { data } = await axios.get(
        `https://ritiks-insight-hub-nameverse.onrender.com/api/youtube/search?q=${searchTerm}`
      );
      setResults(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const debouncedSearch = useCallback(debounce(searchYouTube, 500), []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div className="container mt-5 pt-5">
      <h2 className="fw-bold mb-4">Search YouTube</h2>

      {/* Search Box */}
      <div className="mb-4">
        <input
          className="form-control form-control-lg"
          placeholder="Search..."
          value={query}
          onChange={handleChange}
        />
      </div>

      {/* Results */}
      <div className="d-flex flex-column gap-4">
        {results.map((video) => (
          <div
            key={video.videoId}
            className="d-flex"
            style={{
              cursor: "pointer",
              borderBottom: "1px solid #e5e5e5",
              paddingBottom: "16px",
            }}
          >
            {/* Thumbnail */}
            <a
              href={`https://youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="me-3"
              style={{ flexShrink: 0 }}
            >
              <img
                src={video.thumbnails.medium.url}
                alt={video.title}
                className="rounded"
                style={{
                  width: "246px",
                  height: "138px",
                  objectFit: "cover",
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </a>

            {/* Video Details */}
            <div>
              {/* Title */}
              <a
                href={`https://youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="fw-bold"
                style={{
                  fontSize: "18px",
                  color: "#030303",
                  textDecoration: "none",
                }}
                onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                {video.title}
              </a>

              {/* Channel & Meta */}
              <p className="mb-1" style={{ color: "#606060", fontSize: "14px" }}>
                <span className="fw-semibold">{video.channelTitle}</span> •{" "}
                {new Date(video.publishedAt).toLocaleDateString()}
              </p>

              {/* Description */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#606060",
                  maxWidth: "650px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                }}
              >
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
