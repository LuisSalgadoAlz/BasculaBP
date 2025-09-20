import { apiRequest } from "../../lib/apiClient";

export const getDataForSelect = async (fun, setIsLoading, selected) => {
  const params = new URLSearchParams({ typeImp: selected.typeImp, buque: selected.buque }).toString();
  return apiRequest(fun, `informes/buques?${params}`, setIsLoading)
};

export const getResumenBFH = async (fun, setIsLoading, selected, factura, typeImp) => {
  const params = new URLSearchParams({ buque: selected, factura, typeImp }).toString();
  return apiRequest(fun, `informes/resumenBFH?${params}`, setIsLoading)
};

export const getBuquesDetalles = async (fun, setIsLoading, selected, page, factura, typeImp) => {
  const params = new URLSearchParams({ buque: selected, page, factura, typeImp }).toString();
  return apiRequest(fun, `informes/buquedetalles?${params}`, setIsLoading)
};

export const getStatsBuque = async (fun, setIsLoading, selected, factura, typeImp) => {
  const params = new URLSearchParams({ buque: selected, factura, typeImp }).toString();
  return apiRequest(fun, `informes/stats?${params}`, setIsLoading)
};