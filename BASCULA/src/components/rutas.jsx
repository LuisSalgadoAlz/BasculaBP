import { MdOutlineDashboard } from "react-icons/md";
import { BsClipboard2Pulse } from "react-icons/bs";
import { RiTruckLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { FaTruckLoading } from "react-icons/fa";
import { BsClipboard2Data } from "react-icons/bs";
import { AiFillCaretRight } from "react-icons/ai";
import { BsCalendarWeek } from "react-icons/bs";

const RUTAS_PRINCIPALES = [
  /* 
    Se deshabilito de bascula
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <MdOutlineDashboard />,
  }, */
  {
    path: "/socios",
    name: "Socios",
    icon: <FiUsers />,
  },
  {
    path: "/empresas",
    name: "Empresas",
    icon: <RiTruckLine />,
  },
  {
    path: "/boletas",
    name: "Boletas",
    icon: <BsClipboard2Pulse />,
  },
];

const RUTAS_ADMIN = [
  {
    path: "/admin/dashboard",
    name: "Dashboard",
    icon: <MdOutlineDashboard />,
  },
  {
    path: "/admin/usuarios",
    name: "Usuarios",
    icon: <FiUsers />,
  },
  {
    path: "/admin/logs",
    name: "Logs",
    icon: <BsClipboard2Pulse />,
  }
];

const RUTAS_REPORTES = [
  {
    path: "/calendario",
    name: "Historico Boletas",
    icon: <BsCalendarWeek />,
  },
  {
    path: "/reporteGuardia",
    name: "Pases de Salida",
    icon: <BsCalendarWeek />,
  },
  {
    path: "/informes",
    name: "Constructor",
    icon: <BsClipboard2Data  />,
  },
  {
    path: "/importaciones-granza",
    name: "Importaciones",
    icon: <BsClipboard2Data />,
  },
  {
    path: "/casulla",
    name: "Casulla",
    icon: <BsClipboard2Data />,
  },
  {
    path: "/servicioBascula",
    name: "Servicio Báscula",
    icon: <BsClipboard2Data />,
  },
  {
    path: "/reporteSilos",
    name: "Estado Silos",
    icon: <BsClipboard2Data />,
  },
  {
    path: "/reporteTolva",
    name: "Tolva",
    icon: <BsClipboard2Data />,
  },
  {
    path: "/reporteZonasDescarga",
    name: "Ocupación Tolvas",
    icon: <BsClipboard2Data />,
  }
];

const RUTAS_SUPERVISOR = [
  {
    path: '/control', 
    name: 'Zona de Control',
    icon: <AiFillCaretRight />,
  }
]

const RUTAS_PICKING = [
  {
    path: '/picking', 
    name: 'Zona Picking',
    icon: <AiFillCaretRight />,
  }
]

const RUTAS_TOLVA = [
  {
    path: "/tolva/dashboard",
    name: "Descarga",
    icon: <FaTruckLoading />,
  },
]

const RUTAS_GUARDIA = [
  {
    path: "/guardia",
    name: "Control Salida",
    icon: <MdOutlineDashboard />,
  },
]

export { RUTAS_PRINCIPALES, RUTAS_ADMIN, RUTAS_REPORTES, RUTAS_SUPERVISOR, RUTAS_TOLVA, RUTAS_GUARDIA, RUTAS_PICKING };