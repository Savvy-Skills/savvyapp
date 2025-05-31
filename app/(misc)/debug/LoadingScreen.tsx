import React, { useState, useEffect } from "react";
import "./style.css";

export default function GameLoadingScreen({ progress }: { progress: number }) {
//   const [progress, setProgress] = useState(0);
const logo = require("@/assets/images/pngs/savvylogo.png");
  // Simulate download progress
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setProgress((prev) => {
//         const next = prev + Math.random() * 10;
//         return next >= 100 ? 100 : next;
//       });
//     }, 300);
//     return () => clearInterval(interval);
//   }, []);

  return (
    <div className="loading-screen">
      {/* Logo Placement */}
      <div className="logo">
        <img
          src={logo.uri}
          alt="Game Logo"
          className="w-full h-full"
        />
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="progress-text">Loading... {Math.floor(progress)}%</div>
    </div>
  );
}
