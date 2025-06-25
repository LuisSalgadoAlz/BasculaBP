import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Route, RouterProvider } from "react-router";
import "./index.css";
import VerificarLog from "./utils/verificarLog";
import { Spinner } from "./components/alerts";
import ViewDisabled from "./views/viewDisabled";
const DashboardTolva = lazy(()=>import('./views/tolva/dashboard'));
const Users = lazy(()=>import('./views/admin/users'))
const Logs = lazy(()=>import('./views/admin/logs'))
const DashboardAdmin = lazy(()=>import('./views/admin/dashboard'))
const CalendarioView = lazy(()=>import('./views/calendario'))
const NoFoundData = lazy(()=>import('./views/notFoundData'));
const Login = lazy(()=>import('./views/login'));
const Dashboard = lazy(()=>import('./views/dashboard'))
const NotFoundPage = lazy(()=>import('./views/notFoundPage'))
const Boletas = lazy(()=>import('./views/boletas')) 
const Empresa = lazy(()=>import('./views/empresas'))
const Clientes = lazy(()=>import('./views/clientes'))
const EditClientes = lazy(()=>import('./components/clientes/editClientes'))
const EditTransporte = lazy(()=>import('./components/transporte/editEmpresa'))
const Informes = lazy(()=>import('./views/informes'))
const Importaciones = lazy(()=>import('./components/informes/importaciones'))

const navRutas = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <NotFoundPage />,
  },
  {
    element: <VerificarLog userType='ADMINISTRADOR' />,
    children: [
      {
        path: '/admin/dashboard',
        element: <DashboardAdmin />
      },
      {
        path: '/admin/usuarios',
        element: <Users />
      }, 
      {
        path: '/admin/logs',
        element: <Logs />
      }, 
    ]
  },
  {
    element: <VerificarLog userType='TOLVA' />,
    children: [
      {
        path: '/tolva/dashboard',
        element: <DashboardTolva />
      }, 
    ]
  },
  {
    element: <VerificarLog userType='CONTABILIDAD' />,
    children: [
      {
        path: '/contabilidad/dashboard',
        element: <DashboardAdmin />
      }, 
    ]
  },
  {
    element: <VerificarLog userType='BASCULA' />,
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
        path: "/calendario",
        element: <CalendarioView />,
      },
      {
        path: "/informes",
        element: <Informes />,
      },
      {
        path: "/informes/importaciones",
        element: <Importaciones />,
      },
      {
        path: "/informes/diarios",
        element: <ViewDisabled />,
      },
      {
        path: "/informes/semanales",
        element: <ViewDisabled />,
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
