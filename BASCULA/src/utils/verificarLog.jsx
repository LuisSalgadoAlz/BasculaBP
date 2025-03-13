import { Navigate, Outlet } from "react-router";

const VerificarLog = ({token, Children, redirectTo='/'}) => {
    if (!token){
        return <Navigate to={redirectTo} />
    }
    return <Outlet />;
}
 
export default VerificarLog;