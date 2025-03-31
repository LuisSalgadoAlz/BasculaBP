import CardHeader from "../components/card-header";
import Search from "../components/clientes/search";
import { useState } from "react";

const Clientes = () => {
  const [stats, setSats] = useState();

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
        <CardHeader
          data={stats ? stats["totales"] + " / " + stats["totalSocios"] : ""}
          name={"Total de socios (activos / totales)"}
          title={"Socios"}
        />
        <CardHeader
          data={
            stats
              ? stats["ActivosProveedores"] + " / " + stats["totalProveedores"]
              : ""
          }
          name={"Total de proveedores (activos / totales)"}
          title={"Proveedores"}
        />
        <CardHeader
          data={
            stats
              ? stats["ActivosClientes"] + " / " + stats["totalClientes"]
              : ""
          }
          name={"Total de clientes (activos / totales)"}
          title={"Clientes"}
        />
      </div>
      <div className="mt-6 bg-white shadow rounded-lg px-6 py-7 border border-gray-300">
        <Search sts={setSats} />
      </div>
    </>
  );
};

export default Clientes;
