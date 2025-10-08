import { apiRequest } from "../../lib/apiClient";

/**
 * END -  ZONA DE USO GENERAL
 */

export const getUserForFront = async(fun, setIsLoading) =>{
  return apiRequest(fun, `bodegapt/user`, setIsLoading)
}

/**
 * END -  ZONA DE USO DE SUPERVISOR
 */

export const getUsersForManifiestos = async (fun, setIsLoading) => {
  return apiRequest(fun, `bodegapt/list/users`, setIsLoading)
};

export const postAsignarManifiesto = async (manifiesto, setIsLoading) => {
  return apiRequest(null, `bodegapt/asignar/manifiesto`, setIsLoading, {
    method: "POST",
    body: manifiesto,
  })
};

export const getManifiestosLogs = async (fun, setIsLoading, DocNum) => {
  return apiRequest(fun, `bodegapt/manifiestos/logs/${DocNum}`, setIsLoading)
};


/**
 * END -  ZONA DE USO DE PICKING
 */

export const getManifiestosDetalles = async (fun, setIsLoading, DocNum) => {
  return apiRequest(fun, `bodegapt/manifiestos/detalles/${DocNum}`, setIsLoading)
};
