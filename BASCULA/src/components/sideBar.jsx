import { MdOutlineDashboard } from "react-icons/md";
import { BsClipboard2Pulse } from "react-icons/bs";
import { RiTruckLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { useState } from "react";
import { SupportModal } from "./alerts";
import { NavigationRoutes, SideBarBase, SidebarHeader, SupportSection, UserDropdown } from "./sideBar/elements";
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
    name: "Calendario",
    icon: <BsCalendarWeek />,
  },
  {
    path: "/informes",
    name: "Informes",
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
  ,
  {
    path: "/reporteGuardia",
    name: "Guardia",
    icon: <BsClipboard2Data />,
  },
  {
    path: "/reporteTolva",
    name: "Tolva",
    icon: <BsClipboard2Data />,
  }
];


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

export const SideBar = ({ modo = "extendido", altura = 500 }) => {
  const [ShowModalSupport, setShowModalSupport] = useState()
  const handleShowModal = () => setShowModalSupport(true)
  const handleCloseModal = () => setShowModalSupport(false)
  
  const isExtendido = modo === "extendido";

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Sistema de Gestión Bascula" />
      <NavigationRoutes routes={RUTAS_PRINCIPALES} isExtendido={isExtendido} sectionTitle="Bascula" />
      <NavigationRoutes routes={RUTAS_REPORTES} isExtendido={isExtendido} sectionTitle="Reportes" />
      <SupportSection isExtendido={isExtendido} onShowModal={handleShowModal} />
      <UserDropdown isExtendido={isExtendido} altura={altura} />
      {ShowModalSupport && <SupportModal hdClose={handleCloseModal}/>}
    </SideBarBase>
  );
};

export const SideBarAdmin = ({ modo = "extendido", altura = 500 }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const isExtendido = modo === "extendido";

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Administración Bascula" />
      <NavigationRoutes routes={RUTAS_ADMIN} isExtendido={isExtendido} sectionTitle="Admin" userRole={'ADMINISTRADOR'}activeDropdown={activeDropdown}setActiveDropdown={setActiveDropdown}/>
      <NavigationRoutes routes={RUTAS_PRINCIPALES} isExtendido={isExtendido} sectionTitle="Bascula" userRole={'ADMINISTRADOR'}activeDropdown={activeDropdown}setActiveDropdown={setActiveDropdown}/>
      <NavigationRoutes routes={RUTAS_TOLVA} isExtendido={isExtendido} sectionTitle="Tolva" userRole={'ADMINISTRADOR'}activeDropdown={activeDropdown}setActiveDropdown={setActiveDropdown}/>
      <NavigationRoutes routes={RUTAS_GUARDIA} isExtendido={isExtendido} sectionTitle="Guardia" userRole={'ADMINISTRADOR'}activeDropdown={activeDropdown}setActiveDropdown={setActiveDropdown}/>
      {/* <ReportsSection isExtendido={isExtendido} userRole={'ADMINISTRADOR'} /> */}
      <NavigationRoutes routes={RUTAS_REPORTES} isExtendido={isExtendido} sectionTitle="Reportes" userRole={'ADMINISTRADOR'}activeDropdown={activeDropdown}setActiveDropdown={setActiveDropdown}/>

      <UserDropdown isExtendido={isExtendido} altura={altura} />
    </SideBarBase>
  );
};

export const SideBarTolva = ({ modo = "extendido", altura = 500 }) => {
  const [ShowModalSupport, setShowModalSupport] = useState()
  const handleShowModal = () => setShowModalSupport(true)
  const handleCloseModal = () => setShowModalSupport(false)
  
  const isExtendido = modo === "extendido";

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Asignación Tolva"/>
      <NavigationRoutes routes={RUTAS_TOLVA} isExtendido={isExtendido} sectionTitle="Tolva"/>
      <SupportSection isExtendido={isExtendido} onShowModal={handleShowModal} />
      <UserDropdown isExtendido={isExtendido} altura={altura} />
      {ShowModalSupport && <SupportModal hdClose={handleCloseModal}/>}
    </SideBarBase>
  );
};

export const SideBarGuardia = ({ modo = "extendido", altura = 500 }) => {
  const [ShowModalSupport, setShowModalSupport] = useState()
  const handleShowModal = () => setShowModalSupport(true)
  const handleCloseModal = () => setShowModalSupport(false)
  
  const isExtendido = modo === "extendido";

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Control de Guardias"/>
      <NavigationRoutes routes={RUTAS_GUARDIA} isExtendido={isExtendido} sectionTitle="Guardia"/>
      <SupportSection isExtendido={isExtendido} onShowModal={handleShowModal} />
      <UserDropdown isExtendido={isExtendido} altura={altura} />
      {ShowModalSupport && <SupportModal hdClose={handleCloseModal}/>}
    </SideBarBase>
  );
};

export const SideBarReportes = ({ modo = "extendido", altura = 500 }) => {
  const [ShowModalSupport, setShowModalSupport] = useState()
  const handleShowModal = () => setShowModalSupport(true)
  const handleCloseModal = () => setShowModalSupport(false)
  
  const isExtendido = modo === "extendido";

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Sistema de Gestión Báscula" />
      <NavigationRoutes routes={RUTAS_REPORTES} isExtendido={isExtendido} sectionTitle="Reportes" />
      <SupportSection isExtendido={isExtendido} onShowModal={handleShowModal} />
      <UserDropdown isExtendido={isExtendido} altura={altura} />
      {ShowModalSupport && <SupportModal hdClose={handleCloseModal}/>}
    </SideBarBase>
  );
};