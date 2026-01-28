import { useState } from "react";
import "../styles/landing.css";


export default function Landing({ onStart }) {
  const [name, setName] = useState("");

  return (
    <div className="landing">
      <h1>🔨 Live Bidding Platform</h1>

      <input
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button disabled={!name.trim()} onClick={() => onStart(name)}>
        Start Bidding
      </button>
    </div>
  );
}
