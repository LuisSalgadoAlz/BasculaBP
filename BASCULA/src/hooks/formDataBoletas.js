/**
 * 
 * @param {*} arr 
 * @param {*} type 
 * @param {*} pesoIn 
 * @param {*} pesoOut 
 * @returns 
 * Esto se convertira en el procesamiento de datos mas limpios y tambien el hook que verifica los 
 * campos esten llenos y correctamente ingresados
 */

export const getDataFormBoletas = (arr, type, pesoIn, pesoOut) => {
  if (type == 1 && pesoIn) {
    return {
      ...arr,
      "Peso entrada": pesoIn.peso[0].replaceAll("lb", ""),
    };
  }
  return { ...arr, pesoOut };
};
