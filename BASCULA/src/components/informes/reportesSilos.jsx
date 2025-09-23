import { BaprosaSiloChart, BaprosaSiloChart2 } from "../graficos/informes";
import TableSheet from "./tables";
import { useActionBarView, useDetailsSilos, useNivelSilos, useResetSilos } from "../../hooks/informes/hooks";
import { buttonNormal, buttonsInformesLeft, buttonsInformesRight } from "../../constants/boletas";

const ReportesSilos = () => {

  /**
   * ? Hooks personalizados
   */

  const { barView, viewBar1, viewBar2 } = useActionBarView()
  const { nivelSilos, loadingNivelSilos, fetchNivelSilos, handleUpdateBar} = useNivelSilos();
  const { handleClickBar, sheetProps } = useDetailsSilos()
  const { handleResetSilo, loadingReset } = useResetSilos(fetchNivelSilos)
 
  /**
   * ? Props de los gráficos de barras
   */

  const propsBarView1 = {
    data: nivelSilos?.data2,
    onSiloAction: handleResetSilo,
    isLoading: loadingNivelSilos || loadingReset,
    handleClickBar: handleClickBar
  }

  const propsBarView2 = {
    data: nivelSilos?.data,
    onSiloAction: handleResetSilo,
    isLoading: loadingNivelSilos || loadingReset,
    handleBarClick: handleClickBar
  }

  return (
    <>
      <div className="flex justify-between w-full gap-5 max-lg:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Reportes: tolva</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Análisis detallado de la gestión de silos
          </h1>
        </div>
         <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm max-sm:flex-col">
          <div className="flex items-end flex-col sm:flex-row gap-2">
            <div className="flex w-full sm:w-auto">
              <button onClick={viewBar1} className={buttonsInformesLeft}>
                %%
              </button>
              <button onClick={viewBar2} className={buttonsInformesRight}>
                QQ
              </button>
            </div>
            <button onClick={handleUpdateBar} className={buttonNormal}>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {barView ? (
        <BaprosaSiloChart2 {...propsBarView1} />
      ) : (
        <BaprosaSiloChart {...propsBarView2} />
      )}
      <TableSheet {...sheetProps} />
    </>
  );
};

export default ReportesSilos;
