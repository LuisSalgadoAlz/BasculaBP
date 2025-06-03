import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import Header from "../components/header";
import { SideBar, SideBarAdmin, SideBarTolva } from "../components/sideBar";

// Componente genérico
const CuerpoBase = ({ children, SideBarComponent, title, type }) => {
  const [sideBarShow, setSideBarShow] = useState(Cookies.get('sideBarShow') === 'true');
  const [altura, setAltura] = useState(window.innerHeight);
  const [anchura, setAnchura] = useState(window.innerWidth);

  const handleShow = () => {
    const newState = !sideBarShow;
    setSideBarShow(newState);
    Cookies.set('sideBarShow', newState.toString());
  };

  useEffect(() => {
    const modificar = () => {
      setAltura(window.innerHeight);
      setAnchura(window.innerWidth);
    };

    window.addEventListener("resize", modificar);
    return () => window.removeEventListener("resize", modificar);
  }, []);

  const modoCompacto = anchura < 950 || altura <= 750 || !sideBarShow;

  return (
    <main className="min-w-screen min-h-screen flex">
      <SideBarComponent modo={modoCompacto ? "compacto" : undefined} />

      <div className="w-full max-h-screen flex flex-col overflow-hidden">
        <Header title={title} fun={handleShow} type={type} />
        <div className="flex-1 overflow-x-hidden body-components">
          <div className="mx-9 my-7">{children}</div>
        </div>
      </div>
    </main>
  );
};

// Componentes específicos
export const Cuerpo = ({ children }) => (
  <CuerpoBase
    children={children}
    SideBarComponent={SideBar}
    title="Sistema de Gestión de Báscula"
    type="BASCULA"  
  />
);

export const CuerpoAdmin = ({ children }) => (
  <CuerpoBase
    children={children}
    SideBarComponent={SideBarAdmin}
    title="Administración - Sistema Báscula"
    type="ADMINISTRADOR"
  />
);

export const CuerpoTolva = ({ children }) => (
  <CuerpoBase
    children={children}
    SideBarComponent={SideBarTolva}
    title="Tolva - Sistema Báscula"
    type="ADMINISTRADOR"
  />
);