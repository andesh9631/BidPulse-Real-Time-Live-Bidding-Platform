import { socket } from "../socket";
import "../styles/header.css";


export default function Header({ user }) {
  return (
    <header className="header">
      <span>🔨 Live Bidding Platform</span>
      <span>
        [{user}]{" "}
        <b className={socket.connected ? "online" : "offline"}>
          {socket.connected ? "🟢 Connected" : "🔴 Disconnected"}
        </b>
      </span>
    </header>
  );
}
