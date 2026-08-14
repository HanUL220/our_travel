import React from 'react';

export default function Footer() {
  return (
    <footer className="apple-footer">
      <div className="apple-footer-content">
        <p className="apple-footer-subtext">
          Our Special Travel Memories & Stories
        </p>
        <p className="apple-footer-legal">
          Copyright © {new Date().getFullYear()} Our Travel Log. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
