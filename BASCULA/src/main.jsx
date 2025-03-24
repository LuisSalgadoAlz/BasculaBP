import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Route, RouterProvider } from "react-router";
import "./index.css";
const Login = lazy(()=>import('./views/login'));
const VerificarLog = lazy(()=>import('./utils/verificarLog'))
const Dashboard = lazy(()=>import('./views/dashboard'))
const NotFoundPage = lazy(()=>import('./views/notFoundPage'))
const Boletas = lazy(()=>import('./views/boletos')) 
const Empresa = lazy(()=>import('./views/empresas'))
const Clientes = lazy(()=>import('./views/clientes'))
const Productos = lazy(()=>import('./views/productos'))

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
        path: "/Empresas",
        element: <Empresa />,
      },
      {
        path: "/Clientes",
        element: <Clientes />,
      },
      {
        path: "/Productos",
        element: <Productos />,
      },
      {
        path: "/Clientes/:id",
        element: <Productos />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center">Cargando...</div>}>
      <RouterProvider router={navRutas} />
    </Suspense>
  </StrictMode>
);
