import { ButtonAdd, Pagination } from "../buttons";
import { NoData, Spinner } from "../alerts";
import { TableBoletas } from "./tableBoletas";
import { useState, useMemo } from "react";
import { isSelectedView, noSelectectView } from "../../constants/boletas";
import debounce from 'lodash/debounce';

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
    hdlOpenDetails,
    hdlCancel,
    funReimprimir
  } = props;

  const [modeViewComplete, setModeViewComplete] = useState(false);
  const handleSearchDebounced = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
        setPagination(1);
      }, 350), 
    []
  );
  const handleSearch = (e) => {
    handleSearchDebounced(e.target.value);
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
          <TableBoletas datos={boletas.data} fun={hdlOut} funCancel={hdlCancel} funReimprimir={funReimprimir}/>
          <div className="mt-3">
            {boletas.pagination.totalPages > 1 && (
              <Pagination
                pg={pagination}
                sp={setPagination}
                hp={handlePagination}
                dt={boletas}
              />
            )}
          </div>
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
            fun={hdlOpenDetails}
            tipo={1}
          />
          <div className="mt-3">
            {completadas.pagination.totalPages > 1 && (
              <Pagination
                pg={pagination}
                sp={setPagination}
                hp={handlePaginationCompletadas}
                dt={completadas}
              />
            )}
          </div>
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
        {/* <ButtonAdd name="Exportar" /> */}
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
