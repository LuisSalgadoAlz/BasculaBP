import CardHeader from "../components/transporte/card-header";
import Search from "../components/clientes/search";
import { useState, useCallback, useEffect } from "react";

const Clientes = () => {
  const [stats, setSats] = useState()

  return (
    <>
      <div className="flex justify-between w-full gap-5">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Socios de Baprosa</h1>
          <h1 className="text-gray-600">
            {" "}
            Gestiona los proveedores y clientes registrados en el sistema
          </h1>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-5">
        <CardHeader data={stats ? stats['totalSocios'] : ''} name={"Total de socios"} title={"Socios"} />
        <CardHeader
          data={stats ? stats['totalProveedores'] : ''}
          name={"Total de proveedores"}
          title={"Proveedores"}
        />
        <CardHeader data={stats ? stats['totalClientes'] : ''} name={"Total de clientes"} title={"Clientes"} />
      </div>
      <div className="mt-6 bg-white shadow rounded-lg px-6 py-7 border border-gray-300">
        <Search sts = {setSats} />
      </div>
    </>
  );
};

export default Clientes;
