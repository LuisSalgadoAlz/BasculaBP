import { apiRequest } from "../../lib/apiClient";

export const postCreateNewReset = async (siloInfo, setIsLoading) => {
  return apiRequest(null, `tolva/newReset`, setIsLoading, {
    method: "POST",
    body: siloInfo
  })
};

export const getStatsSilosForBuques = async (fun, setIsLoading, buque='', factura='') => {
  const params = new URLSearchParams({ buque, factura, }).toString();
  return apiRequest(fun, `tolva/info/statsTolvas?${params}`, setIsLoading)
};

export const getHistoricoViajes = async (fun, setIsLoading, buque='', factura='', paginacion=1, filters) => {
  const params = new URLSearchParams({
    buque,
    factura,
    page: paginacion,
    usuarioTolva: filters?.userInit_historico,
    usuarioCierre: filters?.userEnd_historico,
    tiempoExcedido: filters?.state_historico,
    searchPlaca: filters?.search_historico,
  }).toString();

  return apiRequest(fun, `tolva/info/historicoViajes?${params}`, setIsLoading)
};

export const getUsers = async (fun, setIsLoading) => {
  return apiRequest(fun, `tolva/info/users`, setIsLoading)
};

export const getInfoSilosV2 = async (fun, setIsLoading) => {
  return apiRequest(fun, `tolva/info/nivelSilos`, setIsLoading)
};

export const getInfoSilosDetailsV2 = async (fun, setIsLoading, siloID) => {
  return apiRequest(fun, `tolva/info/nivelSilos/details/${siloID}`, setIsLoading)
};

export const getTolvasOcupadas = async (fun, setIsLoading) => {
  return apiRequest(fun, `tolva/tolvasOcupadas/info`, setIsLoading)
};