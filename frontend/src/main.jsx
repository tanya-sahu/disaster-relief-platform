
import axios from 'axios';


// 🚀 Yeh line sabhi requests ke liye cookies on kar degi:
axios.defaults.withCredentials = true;

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';




import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
