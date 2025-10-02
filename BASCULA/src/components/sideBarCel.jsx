import { NavLink, useNavigate } from "react-router";
import { PiSignOutFill } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import Cookies from "js-cookie";
import { SlSupport } from "react-icons/sl";
import { useState } from "react";
import { SupportModal } from "./alerts";

import { RUTAS_ADMIN, RUTAS_GUARDIA, RUTAS_PRINCIPALES, RUTAS_REPORTES, RUTAS_TOLVA, RUTAS_SUPERVISOR } from "./rutas";

export const CerrarSession = ({ onClick }) => (
  <button
    className="flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium text-gray-700 elements-active hover:bg-gray-100 hover:shadow-md"
    onClick={onClick}
  >
    <span className="text-2xl text-red-600">
      <PiSignOutFill />
    </span>
  </button>
);

export const CloseButton = ({ onClick }) => (
  <button
    onClick={onClick}
    aria-label="Cerrar modal"
    className="px-5 py-3 text-black bg-white rounded-lg hover:bg-red-600 transition-transform duration-200 hover:scale-105"
  >
    <IoMdClose />
  </button>
);

export const NavItem = ({ data }) => (
  <NavLink
    to={data.path}
    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 elements-active hover:bg-gray-100 hover:shadow-md"
  >
    <span className="text-2xl">{data.icon}</span>
    <span className="flex-1">{data.name}</span>
  </NavLink>
);

export const NavList = ({ routes }) => (
  <ul className="flex flex-col gap-2">
    {routes.map((data, key) => (
      <NavItem key={key} data={data} />
    ))}
  </ul>
);

export const BotonesDeAccion = ({ onLogout, onClose }) => (
  <div className="mt-8 flex justify-center">
    <CerrarSession onClick={onLogout} />
    <CloseButton onClick={onClose} />
  </div>
);

// Componente atómico para el overlay del modal
export const ModalOverlay = ({ children, typeClase = 'bg-black/40' }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${typeClase} backdrop-blur-sm`}>
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-300">
      {children}
    </div>
  </div>
);

// Hook personalizado para manejar el cierre de sesión
export const useLogout = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
  };
  
  return handleLogout;
};

const SupportModalButton = ({openModal}) => {
  return (
    <button
      onClick={openModal}
      className="flex items-center rounded-lg px-4 py-3 mt-2 text-sm font-medium text-gray-700 elements-active hover:bg-gray-100 hover:shadow-md w-full active:bg-red-50"
    >
      <span className="text-2xl"><SlSupport /></span>
      <span className="flex-1">Soporte</span>
    </button>
  )
}

export const BaseSidebar = ({ routes, onClose, modalSupport=true }) => {
  const handleLogout = useLogout();
  const [modal, setModal]= useState(false) 
  
  const openModal = () => {
    setModal(true)
  }
  const closeModal = () => {
    setModal(false)
  }

  return (
    <ModalOverlay typeClase={modal ? 'bg-black/0' : 'bg-black/40'}>
      <NavList routes={routes} />
      {modalSupport && <SupportModalButton openModal={openModal} />}
      <BotonesDeAccion onLogout={handleLogout} onClose={onClose} />
      {modal && <SupportModal hdClose={closeModal}/>}
    </ModalOverlay>
  );
};


export const SideBarCel = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_PRINCIPALES} onClose={hdlClose} />
);

export const SideBarCelAdmin = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_ADMIN} onClose={hdlClose} />
);

export const SideBarCelTolva = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_TOLVA} onClose={hdlClose} />
);

export const SideBarCelGuardia = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_GUARDIA} onClose={hdlClose} />
);

export const SideBarCelReportes = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_REPORTES} onClose={hdlClose} />
);

export const SideBarCelBodegaPT = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_SUPERVISOR} onClose={hdlClose} />
);