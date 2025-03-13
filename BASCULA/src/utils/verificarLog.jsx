import { Navigate, Outlet } from "react-router";

const VerificarLog = ({Children, redirectTo='/'}) => {
    if (!window.localStorage.getItem('token')){
        return <Navigate to={redirectTo} />
    }
    return <Outlet />;
}
 
export default VerificarLog;