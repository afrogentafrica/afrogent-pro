import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { jwtDecode } from "jwt-decode";

// Add JWT decode library (already imported in auth.ts)
window.jwtDecode = jwtDecode;

createRoot(document.getElementById("root")!).render(<App />);
