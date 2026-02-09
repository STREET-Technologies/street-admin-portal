import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Temporary placeholder -- will be replaced by App component in Plan 03
function App() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">STREET Admin Portal</h1>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
