import { Navigate, Outlet, useNavigate } from "react-router";
import {Cuerpo, CuerpoAdmin, CuerpoBodegaPT, CuerpoGuardia, CuerpoReportes, CuerpoTolva} from "../components/cuerpo";
import Cookies from 'js-cookie';
import { useEffect, useMemo } from "react";
import { ModalErr } from '../components/alerts'
import { TOKEN_EXPIRY_MINUTES } from "../constants/global";

const VerificarLog = ({Children, redirectTo='/', userType}) => {
    const navigate = useNavigate()

    const cuerpoMemo = useMemo(() => <Cuerpo><Outlet /></Cuerpo>, []);
    const cuerpoAdmin = useMemo(()=> <CuerpoAdmin><Outlet /></CuerpoAdmin>, [])
    const cuerpoTolva = useMemo(()=> <CuerpoTolva><Outlet /></CuerpoTolva>, [])
    const cuerpoGuardia = useMemo(()=> <CuerpoGuardia><Outlet/> </CuerpoGuardia>, [])
    const cuerpoReportes = useMemo(()=> <CuerpoReportes><Outlet/></CuerpoReportes>, [])
    const cuerpoBodegaPT = useMemo(()=> <CuerpoBodegaPT><Outlet/></CuerpoBodegaPT>, [])

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

    const token = Cookies.get('token');
    const userTypeFromCookie = Cookies.get('type');

    // Token lo mas importante para redirigir a login para que otro usuario no intent
    if (!token) {
        return <Navigate to={redirectTo} />
    }

    // Convertir userType en array para manejar múltiples tipos
    const allowedUserTypes = userType.split(',').map(type => type.trim());
    
    const hasAccess = () => {
        return allowedUserTypes.includes(userTypeFromCookie);
    }

    if (!hasAccess()) {
        return <Navigate to={redirectTo} />
    }

    switch(userTypeFromCookie) {
        case 'ADMINISTRADOR':
            return cuerpoAdmin;
        case 'BASCULA':
            return cuerpoMemo;
        case 'TOLVA':
            return cuerpoTolva;
        case 'GUARDIA':
            return cuerpoGuardia;
        case 'REPORTES':
            return cuerpoReportes;
        case 'BODEGAPT':
            return cuerpoBodegaPT;  
        default:
            return <Navigate to={redirectTo} />
    }
}
 
export default VerificarLog;