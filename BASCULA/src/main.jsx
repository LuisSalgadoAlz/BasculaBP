import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Route, RouterProvider } from "react-router";
import "./index.css";
import VerificarLog from "./utils/verificarLog";
import { Spinner } from "./components/alerts";
import ViewDisabled from "./views/viewDisabled";
const ControlZone = lazy(()=>import('./views/bpt/control'));
const TolvasOcupadas = lazy(()=>import('./components/informes/tolvasOcupadas'));
const ServicioBascula = lazy(()=>import('./components/informes/servicioBascula'));
const ReportesSilos = lazy(()=>import('./components/informes/reportesSilos'));
const ReportesGuardia = lazy(()=>import('./components/informes/reportesGuardia'));
const TolvaReportes  = lazy(()=>import('./components/informes/reportesTolva'));
const Casulla = lazy(()=>import('./components/informes/casulla'));
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
const Guardia = lazy(()=>import('./views/guardia/guardia'))

const navRutas = createBrowserRouter([  
  { path: "/", element: <Login />, errorElement: <NotFoundPage />, },
  {
    element: <VerificarLog userType='ADMINISTRADOR' />,
    children: [
      { path: '/admin/dashboard', element: <DashboardAdmin /> },
      { path: '/admin/usuarios', element: <Users /> }, 
      { path: '/admin/logs', element: <Logs /> },
    ]
  },
  {
    element: <VerificarLog userType='ADMINISTRADOR, TOLVA' />,
    children: [
      { path: '/tolva/dashboard', element: <DashboardTolva /> }, 
    ]
  },
  {
    element: <VerificarLog userType='ADMINISTRADOR, CONTABILIDAD' />,
    children: [
      { path: '/contabilidad/dashboard', element: <DashboardAdmin /> }, 
    ]
  },
  {
    element: <VerificarLog userType='ADMINISTRADOR,GUARDIA' />,
    children: [
      { path: '/guardia', element: <Guardia />}
    ]
  },
  {
    element: <VerificarLog userType='ADMINISTRADOR,BASCULA,REPORTES,TOLVA' />,
    children: [
      { path: "/Dashboard", element: <Dashboard />, },
      { path: "/Boletas", element: <Boletas />, },
      { path: "/Empresas", element: <Empresa />, },
      { path: "/socios", element: <Clientes />, },
      { path: "/calendario", element: <CalendarioView />, },
      { path: "/informes", element: <Informes />, },
      { path: "/importaciones-granza", element: <Importaciones />, },
      { path: "/casulla", element: <Casulla />, },
      { path: "/socios/:id", element: <EditClientes />, errorElement: <NoFoundData /> },
      { path: "/empresas/:id", element: <EditTransporte />, errorElement: <NoFoundData /> },
      { path: "/reporteGuardia", element: <ReportesGuardia/> }, 
      { path: "/servicioBascula", element: <ServicioBascula /> }, 
    ],
  },
  {
    element: <VerificarLog userType='ADMINISTRADOR,BASCULA,REPORTES,TOLVA' />,
    children: [
      { path: "/reporteTolva", element: <TolvaReportes/> },
      { path: "/reporteSilos", element: <ReportesSilos/> },
      { path: "/reporteZonasDescarga", element: <TolvasOcupadas/> }
    ],
  },
  {
    element: <VerificarLog userType='ADMINISTRADOR,BODEGAPT' />,
    children: [
      { path: '/control', element: <ControlZone />}
    ]
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Spinner /></div>}>
      <RouterProvider router={navRutas} />
    </Suspense>
  </StrictMode>
);