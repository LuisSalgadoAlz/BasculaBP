import { apiRequest } from "../../lib/apiClient";

export const getDataCasulla = async (fun, setIsLoading, filters) => {
  const params = new URLSearchParams({ dateIn: filters.dateIn, dateOut: filters.dateOut }).toString();
  apiRequest(fun, `informes/casulla/data?${params}`, setIsLoading)
};

export const getDataCasullaDetalles = async (fun, setIsLoading, filters, socio, destino) => {
  const params = new URLSearchParams({ dateIn: filters.dateIn, dateOut: filters.dateOut, socio, destino }).toString();
  apiRequest(fun, `informes/casulla/data/detalles?${params}`, setIsLoading)
};