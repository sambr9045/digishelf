import React from "react";
import { RouterProvider } from "react-router-dom";

import ReactDOM from "react-dom/client";
import "./assets/css/bootstrap.min.css";
import "./assets/css/animate.css";
import "./assets/css/magnific-popup.min.css";
import "./assets/css/index.css";
import "./styles/tailwind.css";
import router from "./App.jsx";
import { SessionProvider } from "./components/sessionContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SessionProvider>
      <RouterProvider router={router} />{" "}
    </SessionProvider>{" "}
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
