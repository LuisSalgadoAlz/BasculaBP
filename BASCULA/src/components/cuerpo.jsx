import { useState, useEffect } from "react";
import {SideBar, SideBarAdmin} from "../components/sideBar";
import Header from "../components/header";
import Cookies from 'js-cookie'

export const Cuerpo = ({ children }) => {
  const [sideBarShow, setSideBarShow] = useState(Cookies.get('sideBarShow')=='true')
  const [altura, setAltura] = useState(window.innerHeight.toString());
  const [anchura, setAnchura] = useState(window.innerWidth.toString());

  const handleShow = () => {
    setSideBarShow(!sideBarShow)
    Cookies.set('sideBarShow', !sideBarShow);
  };

  useEffect(() => {
    const modificar = () => {
      setAltura(window.innerHeight);
      setAnchura(window.innerWidth);
    };

    window.addEventListener("resize", modificar);

    return () => {
      window.removeEventListener("resize", modificar);
    };
  }, []);

  return (
    <>
      <main className="min-w-screen min-h-screen flex">
        {anchura < 950 || altura <= 750 || !sideBarShow ? (
          <SideBar modo="compacto" />
        ) : (
          <SideBar />
        )}

        {/* header */}
        <div className="w-full max-h-screen flex flex-col overflow-hidden">
          <Header title="Sistema de Gestión de Báscula" fun={handleShow} />
          <div className="flex-1 overflow-x-hidden body-components">
            <div className="mx-9 my-7">{children}</div>
          </div>
        </div>
      </main>
    </>
  );
};

export const CuerpoAdmin = ({ children }) => {
  const [sideBarShow, setSideBarShow] = useState(Cookies.get('sideBarShow')=='true')
  const [altura, setAltura] = useState(window.innerHeight.toString());
  const [anchura, setAnchura] = useState(window.innerWidth.toString());

  const handleShow = () => {
    setSideBarShow(!sideBarShow)
    Cookies.set('sideBarShow', !sideBarShow);
  };

  useEffect(() => {
    const modificar = () => {
      setAltura(window.innerHeight);
      setAnchura(window.innerWidth);
    };

    window.addEventListener("resize", modificar);

    return () => {
      window.removeEventListener("resize", modificar);
    };
  }, []);

  return (
    <>
      <main className="min-w-screen min-h-screen flex">
        {anchura < 950 || altura <= 750 || !sideBarShow ? (
          <SideBarAdmin modo="compacto" />
        ) : (
          <SideBarAdmin />
        )}

        {/* header */}
        <div className="w-full max-h-screen flex flex-col overflow-hidden">
          <Header title="Administración - Sistema Báscula" fun={handleShow} />
          <div className="flex-1 overflow-x-hidden body-components">
            <div className="mx-9 my-7">{children}</div>
          </div>
        </div>
      </main>
    </>
  );
};