import "../styles/toast.css";

export default function Notification({ message, type }) {
  return <div className={`toast ${type}`}>{message}</div>;
}

