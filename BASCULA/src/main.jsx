import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Route, RouterProvider } from "react-router";
import Login from "./views/login";
import "./index.css";
import VerificarLog from "./utils/verificarLog";
import Dashboard from "./views/dashboard";
import NotFoundPage from "./views/notFoundPage";
import Boletas from "./views/boletos";
import Transporte from "./views/transporte";
import Clientes from "./views/clientes";
import Productos from "./views/productos";

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
      {
        path: "/Boletas",
        element: <Boletas />,
      },
      {
        path: "/Transporte",
        element: <Transporte />,
      },
      {
        path: "/Clientes",
        element: <Clientes />,
      },
      {
        path: "/Productos",
        element: <Productos />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={navRutas} />
  </StrictMode>
);
