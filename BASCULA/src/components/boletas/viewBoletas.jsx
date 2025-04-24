import { ButtonAdd, Pagination } from "../buttons";
import { NoData, Spinner } from "../alerts";
import { TableBoletas } from "./tableBoletas";
import { useState } from "react";
import { isSelectedView, noSelectectView } from "../../constants/boletas";

const ViewBoletas = (props) => {
  const {
    boletas,
    hdlOut,
    isLoad,
    setSearch,
    isLoadCompletadas,
    setSearchDate,
    pagination,
    setPagination,
    handlePagination,
    completadas,
    handlePaginationCompletadas,
  } = props;

  const [modeViewComplete, setModeViewComplete] = useState(false);
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(1);
  };
  const handleSearchDate = (e) => {
    setSearchDate(e.target.value);
    setPagination(1);
  };

  const handleClickNoShow = () => {
    setModeViewComplete(true);
    setPagination(1);
  };
  const handleClickshow = () => {
    setModeViewComplete(false);
    setPagination(1);
  };

  const handleChangeView = () => {
    if (!modeViewComplete) {
      if (isLoad && !boletas) {
        return <Spinner />;
      }
      if (!boletas?.data || boletas.data.length === 0) {
        return <NoData />;
      }

      return (
        <>
          <TableBoletas datos={boletas.data} fun={hdlOut} />
          {boletas.pagination.totalPages > 1 && (
            <Pagination
              pg={pagination}
              sp={setPagination}
              hp={handlePagination}
              dt={boletas}
            />
          )}
        </>
      );
    } else {
      if (isLoadCompletadas && !completadas) {
        return <Spinner />;
      }
      if (!completadas?.data || completadas.data.length === 0) {
        return <NoData />;
      }
      return (
        <>
          <TableBoletas
            datos={completadas.data}
            fun={(fila) => console.log(fila)}
          />
          {completadas.pagination.totalPages > 1 && (
            <Pagination
              pg={pagination}
              sp={setPagination}
              hp={handlePaginationCompletadas}
              dt={completadas}
            />
          )}
        </>
      );
    }
  };

  return (
    <>
      <div className="filtros grid grid-rows-1 grid-cols-5 grid-flow-col gap-2 max-md:grid-rows-2 max-md:grid-cols-2 max-sm:grid-rows-2 max-sm:grid-cols-1">
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full"
          type="text"
          placeholder="Buscar boletas por ID, placas o motorista..."
          onChange={handleSearch}
        />
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden"
          type="date"
          onChange={handleSearchDate}
        />
        <ButtonAdd name="Exportar" />
      </div>
      <div className="filtros grid grid-rows-1 grid-flow-col">
        <button
          onClick={handleClickshow}
          className={
            modeViewComplete == false ? isSelectedView : noSelectectView
          }
        >
          Pendientes
        </button>
        <button
          onClick={handleClickNoShow}
          className={
            modeViewComplete == true ? isSelectedView : noSelectectView
          }
        >
          Completadas
        </button>
      </div>
      <div className="mt-4">{handleChangeView()}</div>
    </>
  );
};

export default ViewBoletas;
