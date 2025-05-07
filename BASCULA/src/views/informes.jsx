import { use, useEffect, useState } from "react";
import { ModalErr, NoData, Spinner } from "../components/alerts";
import TableHistorial from "../components/historial/tables";
import {
  getHistorialBoletas,
  getDataForSelect,
} from "../hooks/formDataInformes";
import { ButtonAdd } from "../components/buttons";
import { FiltrosReporteria } from "../components/informes/filters";
import { DistribucionPorTipoChart } from "../components/graficos/charts";
import { URLHOST } from "../constants/global";

const Informes = () => {
  const [data, setData] = useState();
  const [isLoad, setIsload] = useState(false);
  const [dataSelect, setDataSelect] = useState({});
  const [formFiltros, setFormFiltros] = useState({
    movimiento: "",
    producto: "",
    socio:""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [err, setErr] = useState(false);
  const [msg, setMsg] = useState();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(formFiltros);
  };

  useEffect(() => {
    getDataForSelect(setDataSelect);
  }, []);

  const handlePrint = (boleta) => {
    console.log(boleta);
  };

  const handlePushFilter = () => {
    if (!formFiltros?.dateIn || !formFiltros?.dateOut) {
      setErr(true);
      setMsg(
        "Ingrese la fecha inicial y fecha final, para poder realizar el filtrado o exportaciones a: PDF | Excel"
      );
      return;
    }
    getHistorialBoletas(setData, formFiltros, setIsload);
  };

  const handleExportToExcel = () => {
    if (!formFiltros?.dateIn || !formFiltros?.dateOut) {
      setErr(true);
      setMsg(
        "Ingrese la fecha inicial y fecha final, para poder realizar el filtrado o exportaciones a: PDF | Excel"
      );
      return;
    }

    const url = `${URLHOST}boletas/export/excel?movimiento=${formFiltros?.movimiento}&producto=${formFiltros?.producto}&dateIn=${formFiltros?.dateIn}&dateOut=${formFiltros?.dateOut}`;
    window.open(url, '_blank');
  };

  const handleCloseErr = () => {
    setErr(false);
  };

  /**
   * Props para los hijos de los componentes
   * !importante @props actuales
   */
  const propsFiltros = { handleChange, dataSelect, handlePushFilter };
  const propsModalErr = { name: msg, hdClose: handleCloseErr };
  const propsTable = { datos: data?.table, imprimirCopia: handlePrint };
  const propsGraficosProceso = {
    data: data?.graphProcesos,
    title: "Distribucion de Procesos",
    subtitle:
      "Distribucion por porcentaje de entradas, salidas y boletas canceladas",
  };
  const propsGraficosTipoDeBoleta = {
    data: data?.graphEstados,
    title: "Distribucion por Tipo De Boleta",
    subtitle:
      "Distribucion por porcentaje de boleta especial, comodin y boleta normal",
  };

  return (
    <>
      <div className="flex justify-between w-full gap-5">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Reportes de boletas</h1>
          <h1 className="text-gray-600">
            {" "}
            Gestiona los informes generados en el sistema.
          </h1>
        </div>
      </div>
      <div
        className={`mt-6 bg-white shadow rounded-lg px-6 py-7 border border-gray-300`}
      >
        <div className="filtros grid grid-rows-1 grid-cols-5 grid-flow-col gap-2 max-md:grid-rows-2 max-md:grid-cols-2 max-sm:grid-rows-2 max-sm:grid-cols-1 mb-4">
          <input
            className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full"
            type="text"
            placeholder="Buscar boletas por ID, placas o motorista..."
          />
          <ButtonAdd name="Exportar PDF" />
          <ButtonAdd name="Exportar EXCEL" fun={handleExportToExcel}/>
        </div>
        <div className="p-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-600">
              Filtros de Reporte
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </button>
          </div>

          {showFilters && <FiltrosReporteria {...propsFiltros} />}
        </div>
        <div className="mt-4">
          {isLoad && !data ? (
            <Spinner />
          ) : !data || data.table.length == 0 ? (
            <NoData />
          ) : (
            <>
              <div className="grid grid-cols-2">
                <DistribucionPorTipoChart {...propsGraficosProceso} />
                <DistribucionPorTipoChart {...propsGraficosTipoDeBoleta} />
              </div>
              <hr className="mt-10 mb-4 text-gray-400" />
              <TableHistorial {...propsTable} />
            </>
          )}
        </div>
      </div>
      {err && <ModalErr {...propsModalErr} />}
    </>
  );
};

export default Informes;
