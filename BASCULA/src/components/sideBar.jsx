import { useState } from "react";
import { SupportModal } from "./alerts";
import { NavigationRoutes, SideBarBase, SidebarHeader, SupportSection, UserDropdown } from "./sideBar/elements";
import Cookie from 'js-cookie'
import { RUTAS_ADMIN, RUTAS_GUARDIA, RUTAS_PRINCIPALES, RUTAS_REPORTES, RUTAS_SUPERVISOR, RUTAS_TOLVA } from "./rutas";

export const SideBar = ({ modo = "extendido", altura = 500 }) => {
  const [ShowModalSupport, setShowModalSupport] = useState()
  const handleShowModal = () => setShowModalSupport(true)
  const handleCloseModal = () => setShowModalSupport(false)
  
  const isExtendido = modo === "extendido";

  const FILTER_ROUTES = RUTAS_REPORTES.filter(
    (item) => !item.name.includes('Pases de Salida') && !item.name.includes('Tolva') && !item.name.includes('Estado Silos')
  );

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Sistema de Gestión Bascula" />
      <NavigationRoutes routes={RUTAS_PRINCIPALES} isExtendido={isExtendido} sectionTitle="Bascula" />
      <NavigationRoutes routes={FILTER_ROUTES} isExtendido={isExtendido} sectionTitle="Reportes" />
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
  
  const RUTA_REPORTE = RUTAS_REPORTES.filter((item) => item.name.includes('Estado Silos') || item.name.includes('Tolva') || item.name.includes('Zonas de Descarga'))
  const isExtendido = modo === "extendido";

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Asignación Tolva"/>
      <NavigationRoutes routes={RUTAS_TOLVA} isExtendido={isExtendido} sectionTitle="Tolva"/>
      {Cookie.get('name') === 'Rony Romero' && (
        <NavigationRoutes routes={RUTA_REPORTE} isExtendido={isExtendido} sectionTitle="Tolva"/>
      )}
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
  
  const RUTAS_SIN_SILOS = RUTAS_REPORTES.filter(
    (item) => !item.name.includes('Estado Silos')
  );

  const isExtendido = modo === "extendido";

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Sistema de Gestión Báscula" />
      <NavigationRoutes routes={RUTAS_SIN_SILOS} isExtendido={isExtendido} sectionTitle="Reportes" />
      <SupportSection isExtendido={isExtendido} onShowModal={handleShowModal} />
      <UserDropdown isExtendido={isExtendido} altura={altura} />
      {ShowModalSupport && <SupportModal hdClose={handleCloseModal}/>}
    </SideBarBase>
  );
};


export const SideBarBodegaPT = ({ modo = "extendido", altura = 500 }) => {
  const [ShowModalSupport, setShowModalSupport] = useState()
  const handleShowModal = () => setShowModalSupport(true)
  const handleCloseModal = () => setShowModalSupport(false)

  const isExtendido = modo === "extendido";

  return (
    <SideBarBase extended={isExtendido}>
      <SidebarHeader isExtendido={isExtendido} title="Baprosa" subtitle="Sistema de Gestión Bodega PT" />
      <NavigationRoutes routes={RUTAS_SUPERVISOR} isExtendido={isExtendido} sectionTitle="Supervisor" />
      <SupportSection isExtendido={isExtendido} onShowModal={handleShowModal} />
      <UserDropdown isExtendido={isExtendido} altura={altura} />
      {ShowModalSupport && <SupportModal hdClose={handleCloseModal}/>}
    </SideBarBase>
  );
};