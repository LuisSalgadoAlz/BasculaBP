import { Navigate, Outlet } from "react-router";
import Cuerpo from "../components/cuerpo";

const VerificarLog = ({Children, redirectTo='/'}) => {
    if (!window.localStorage.getItem('token')){
        return <Navigate to={redirectTo} />
    }
    return <Cuerpo><Outlet/></Cuerpo>;
}
 
export default VerificarLog;