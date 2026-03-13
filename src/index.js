import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import PublicCard from "./PublicCard";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicCard />} />
        <Route path="/edit" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
