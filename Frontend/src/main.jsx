import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "antd/dist/reset.css";
import App from "./App.jsx";
import Login from "./components/Login";
import AuthCallback from "./components/AuthCallback.jsx";
import SegmentBuilder from "./components/SegmentBuilder.jsx";
import CampaignCreator from "./components/CampaignCreator.jsx";
import CampaignList from "./components/CampaignList.jsx";
import CampaignDetail from "./components/CampaignDetail.jsx";
import EmailComingSoon from "./components/ComingSoon.jsx";
import Dashboard from "./components/Dashboard.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "segments/new", element: <SegmentBuilder /> },
      { path: "campaigns", element: <CampaignList /> },
      { path: "campaigns/new", element: <CampaignCreator /> },
      { path: "campaigns/:id", element: <CampaignDetail /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/login/email", element: <EmailComingSoon /> },
  { path: "/auth/callback", element: <AuthCallback /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
