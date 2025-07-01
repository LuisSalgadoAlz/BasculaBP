import { MdOutlineDashboard } from "react-icons/md";
import { BsClipboard2Pulse } from "react-icons/bs";
import { RiTruckLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { useState } from "react";
import { SupportModal } from "./alerts";
import { CalendarSection, LogsSection, NavigationRoutes, ReportsSection, SideBarBase, SidebarHeader, SupportSection, UserDropdown } from "./sideBar/elements";

const RUTAS_PRINCIPALES = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <MdOutlineDashboard />,
  },
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
];

const RUTAS_TOLVA = [
  {
    path: "/tolva/dashboard",
    name: "Dashboard",
    icon: <MdOutlineDashboard />,
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
      <CalendarSection isExtendido={isExtendido} />
      <ReportsSection isExtendido={isExtendido} />
      <SupportSection isExtendido={isExtendido} onShowModal={handleShowModal} />
      <UserDropdown isExtendido={isExtendido} altura={altura} />
      {ShowModalSupport && <SupportModal hdClose={handleCloseModal}/>}
    </SideBarBase>
  );
};

export const SideBarAdmin = ({ modo = "extendido", altura = 500 }) => {
  const isExtendido = modo === "extendido";

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Administración Bascula" />
      <NavigationRoutes routes={RUTAS_ADMIN} isExtendido={isExtendido} sectionTitle="Admin"/>
      <LogsSection isExtendido={isExtendido}/>
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