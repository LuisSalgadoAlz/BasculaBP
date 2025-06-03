import { Navigate, Outlet, useNavigate } from "react-router";
import {Cuerpo, CuerpoAdmin, CuerpoTolva} from "../components/cuerpo";
import Cookies from 'js-cookie';
import { useEffect, useMemo } from "react";
import { ModalErr } from '../components/alerts'
import { TOKEN_EXPIRY_MINUTES } from "../constants/global";

const VerificarLog = ({Children, redirectTo='/', userType}) => {
    const navigate = useNavigate()

    const cuerpoMemo = useMemo(() => <Cuerpo><Outlet /></Cuerpo>, []);
    const cuerpoAdmin = useMemo(()=> <CuerpoAdmin><Outlet /></CuerpoAdmin>, [])
    const cuerpoTolva = useMemo(()=> <CuerpoTolva><Outlet /></CuerpoTolva>, [])

    const sessionActive = () => {
        if (Cookies.get('token')) {
            const expirationDate = new Date();
            /**
             * ? Tiempo de expiracion de 30 minutos 
             */
            expirationDate.setMinutes(expirationDate.getMinutes() + TOKEN_EXPIRY_MINUTES);
            Cookies.set('token', Cookies.get('token'), { expires: expirationDate });
            Cookies.set('type', Cookies.get('type'), { expires: expirationDate });
            Cookies.set('name', Cookies.get('name'), { expires: expirationDate });
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
    if (Cookies.get('type') == 'TOLVA') return cuerpoTolva;
}
 
export default VerificarLog;