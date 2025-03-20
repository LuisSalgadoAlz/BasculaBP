export const getDataFormBoletas = ({ arr, type, pesoIn, pesoOut }) => {
    if (type==1 && pesoIn){
        return {...arr, pesoIn}
    }
    return {...arr, pesoOut}
}