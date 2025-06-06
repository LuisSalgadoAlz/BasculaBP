import { useEffect, useState } from "react";
import CardHeader from "../components/card-header";
import Search from "../components/transporte/search";

const Transporte = () => {
  const [stats, setStats] = useState()
  
  return (
    <>
      <div className="flex justify-between w-full gap-5">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Empresas de Transporte</h1>
          <h1 className="text-gray-600">
            {" "}
            Gestiona las empresas de transporte registradas en el sistema.
          </h1>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-5">
        <CardHeader data={stats && stats.totalEmpresas} name={"Total de empresas"} title={"Empresa"} />
        <CardHeader data={stats && stats.totalActivas} name={"Total de activas"} title={"Activas"} />
      </div>
      <div className="mt-6 bg-white shadow rounded-lg px-6 py-7 border border-gray-300">
        <Search sts={setStats} />
      </div>
    </>
  );
};

export default Transporte;
