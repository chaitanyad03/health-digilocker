import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import Auth from "./components/Auth";
import UploadReport from "./components/UploadReport";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/upload" element={<UploadReport />} />
    </Routes>
  </BrowserRouter>
);
