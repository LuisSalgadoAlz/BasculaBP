import { Navigate, Outlet, useNavigate } from "react-router";
import Cuerpo from "../components/cuerpo";
import Cookies from 'js-cookie';
import { useEffect, useMemo } from "react";
import { ModalErr } from '../components/alerts'

const VerificarLog = ({Children, redirectTo='/'}) => {
    const navigate = useNavigate()

    const cuerpoMemo = useMemo(() => <Cuerpo><Outlet /></Cuerpo>, []);

    const sessionActive = () => {
        if (Cookies.get('token')) {
            const expirationDate = new Date();
            /**
             * ? Tiempo de expiracion de 10 minutos 
             */
            expirationDate.setMinutes(expirationDate.getMinutes() + 30);
            Cookies.set('token', Cookies.get('token'), { expires: expirationDate });
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

    if (!Cookies.get('token')){
        return <Navigate to={redirectTo} />
    }
    return cuerpoMemo;
}
 
export default VerificarLog;