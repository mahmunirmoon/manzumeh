import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./mobile-fixes.css";
import App from "./App.tsx";
import { HelpWidget } from "./components/HelpWidget";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <HelpWidget />
  </React.StrictMode>,
);
