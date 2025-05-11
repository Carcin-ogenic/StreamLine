import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "antd/dist/reset.css";
import App from "./App.jsx";
import Login from "./components/Login";
import AuthCallback from "./components/AuthCallback.jsx";
import SegmentBuilder from "./components/SegmentBuilder.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App />, children: [{ path: "segments/new", element: <SegmentBuilder /> }] },
  { path: "/login", element: <Login /> },
  { path: "/auth/callback", element: <AuthCallback /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
