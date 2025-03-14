import { useState } from "react";
import SideBar from "../components/sideBar"
import Header from "../components/header";
import SideBarIcons from "../components/sideBarIcons";

const Dashboard = () => {
  const [sideBarShow, setSideBarShow] = useState(true)

  const handleShow = () => {
    setSideBarShow(!sideBarShow)
  }

  return (
    <>
      <main className="min-w-screen min-h-screen flex">
        {sideBarShow ? <SideBar /> : <SideBarIcons />}
        {/* header */}
        <Header title={"Sistema de Gestión de Báscula"} fun={handleShow} />
      </main>
    </>
  );
};

export default Dashboard;
