import { useState, useEffect } from "react";
import SideBar from "../components/sideBar";
import Header from "../components/header";
import SideBarIcons from "../components/sideBarIcons";

const Cuerpo = ({ children }) => {
  const [sideBarShow, setSideBarShow] = useState(true);
  const [altura, setAltura] = useState(window.innerHeight.toString());

  const handleShow = () => {
    setSideBarShow(!sideBarShow);
  };

  useEffect(() => {
    const modificar = () => {
      setAltura(window.innerHeight);
    };

    window.addEventListener("resize", modificar);

    return () => {
      window.removeEventListener("resize", modificar);
    };
  }, []);

  return (
    <>
      <main className="min-w-screen min-h-screen flex">
        {/* Manejo de los sideBar con la altura de la ventana */}
        {altura > 750 ? (
          sideBarShow ? (
            <SideBar />
          ) : (
            <SideBarIcons />
          )
        ) : (
          <SideBarIcons />
        )}

        {/* header */}
        <div className="w-full min-h-screen flex flex-col overflow-hidden">
          <Header title="Sistema de Gestión de Báscula" fun={handleShow} />
          <div className="flex-1 overflow-x-hidden body-components">
            <div className="m-7">{children}</div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Cuerpo;
