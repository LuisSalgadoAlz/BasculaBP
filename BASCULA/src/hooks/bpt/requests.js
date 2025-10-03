import { apiRequest } from "../../lib/apiClient";

export const getUsersForManifiestos = async (fun, setIsLoading) => {
  return apiRequest(fun, `bodegapt/list/users`, setIsLoading)
};

export const postAsignarManifiesto = async (manifiesto, setIsLoading) => {
  return apiRequest(null, `bodegapt/asignar/manifiesto`, setIsLoading, {
    method: "POST",
    body: manifiesto,
  })
};