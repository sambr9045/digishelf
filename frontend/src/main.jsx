import React from "react";
import { RouterProvider } from "react-router-dom";

import ReactDOM from "react-dom/client";
import "./assets/css/index.css";
import router from "./App.jsx";
import { SessionProvider } from "./components/sessionContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SessionProvider>
      <RouterProvider router={router} />{" "}
    </SessionProvider>{" "}
  </React.StrictMode>
);
