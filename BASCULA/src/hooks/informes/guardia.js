import { apiRequest } from "../../lib/apiClient";

export const getPorcentajeMes = async (fun, start, end, setIsLoading) => {
  const params = new URLSearchParams({ start, end }).toString();
  apiRequest(fun, `guardia/calendario/mes?${params}`, setIsLoading)
};

export const getBoletasPorDia = async (fun, setIsLoading, boleta) => {
  apiRequest(fun, 'guardia/calendario/dia', setIsLoading, {
    method: "POST",
    body: {boleta}
  })
};

export const getStatsServicioBascula = async (fun, setIsLoading, filters) => {
  const params = new URLSearchParams({ dateIn: filters.dateIn, dateOut: filters.dateOut }).toString();
  apiRequest(fun, `guardia/servicioBascula/stats?${params}`, setIsLoading)
};

export const getBoletasServicioBascula = async (fun, setIsLoading, filters, page) => {
  const params = new URLSearchParams({ dateIn: filters.dateIn, dateOut: filters.dateOut, page }).toString();
  apiRequest(fun, `guardia/servicioBascula/boletas?${params}`, setIsLoading)
};