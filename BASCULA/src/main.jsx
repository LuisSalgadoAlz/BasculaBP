import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Route, RouterProvider } from "react-router";
import Login from "./views/login";
import "./index.css";
import VerificarLog from "./utils/verificarLog";
import Dashboard from "./views/dashboard";
import NotFoundPage from "./views/notFoundPage";

const navRutas = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <NotFoundPage />,
  },
  {
    element: <VerificarLog token={window.localStorage.getItem("token")} />,
    children: [
      {
        path: "/Dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={navRutas} />
  </StrictMode>
);
