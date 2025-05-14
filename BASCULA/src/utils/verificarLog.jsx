import { Navigate, Outlet, useNavigate } from "react-router";
import {Cuerpo, CuerpoAdmin} from "../components/cuerpo";
import Cookies from 'js-cookie';
import { useEffect, useMemo } from "react";
import { ModalErr } from '../components/alerts'

const VerificarLog = ({Children, redirectTo='/', userType}) => {
    const navigate = useNavigate()

    const cuerpoMemo = useMemo(() => <Cuerpo><Outlet /></Cuerpo>, []);
    const cuerpoAdmin = useMemo(()=> <CuerpoAdmin><Outlet /></CuerpoAdmin>, [])

    const sessionActive = () => {
        if (Cookies.get('token')) {
            const expirationDate = new Date();
            /**
             * ? Tiempo de expiracion de 30 minutos 
             */
            expirationDate.setMinutes(expirationDate.getMinutes() + 30);
            Cookies.set('token', Cookies.get('token'), { expires: expirationDate });
            Cookies.set('type', Cookies.get('type'), { expires: expirationDate });
            return
        }
        <ModalErr name={'Session Expiro!'} />
        navigate('/')
    }
    
    useEffect(() => {
        sessionActive();    
        window.addEventListener('click', sessionActive);
        return () => {
          window.removeEventListener('click', sessionActive);
        };
      }, []);

    if (!Cookies.get('token') || Cookies.get('type')!=userType){
        return <Navigate to={redirectTo} />
    }

    if (Cookies.get('type') == 'ADMINISTRADOR') return cuerpoAdmin;
    if (Cookies.get('type') == 'BASCULA') return cuerpoMemo;
}
 
export default VerificarLog;