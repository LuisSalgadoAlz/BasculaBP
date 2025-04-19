import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Route, RouterProvider } from "react-router";
import "./index.css";
import VerificarLog from "./utils/verificarLog";
import { Spinner } from "./components/alerts";
const NoFoundData = lazy(()=>import('./views/notFoundData'));
const Login = lazy(()=>import('./views/login'));
const Dashboard = lazy(()=>import('./views/dashboard'))
const NotFoundPage = lazy(()=>import('./views/notFoundPage'))
const Boletas = lazy(()=>import('./views/boletas')) 
const Empresa = lazy(()=>import('./views/empresas'))
const Clientes = lazy(()=>import('./views/clientes'))
const EditClientes = lazy(()=>import('./components/clientes/editClientes'))
const EditTransporte = lazy(()=>import('./components/transporte/editEmpresa'))

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
        path: "/socios",
        element: <Clientes />,
      },
      {
        path: "/socios/:id",
        element: <EditClientes />,
        errorElement: <NoFoundData />
      },
      {
        path: "/empresas/:id",
        element: <EditTransporte />,
        errorElement: <NoFoundData />
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Spinner /></div>}>
      <RouterProvider router={navRutas} />
    </Suspense>
  </StrictMode>
);
