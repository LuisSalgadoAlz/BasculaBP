import { useState } from "react";
import { BiUser, BiLockAlt } from "react-icons/bi";
import ModalError from "../components/modals";
import { useNavigate } from "react-router";
import { AUTH_CONFIG, TOKEN_EXPIRY_MINUTES, URLHOST } from '../constants/global'
import Cookies from 'js-cookie';

const Login = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    usuarios: "",
    contrasena: "",
  });
  const [msg, setMsg] = useState();

  const changeUser = (e) => {
    setData((prev) => ({ ...prev, usuarios: e.target.value }));
  };

  const changeContra = (e) => {
    setData((prev) => ({ ...prev, contrasena: e.target.value }));
  };

  const verificarLog = async () => {
    try {
      setIsLoading(true)
      const token = await fetch(`${URLHOST}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      const res = await token.json();

      const setAuthCookies = (token, type, name) => {
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + TOKEN_EXPIRY_MINUTES);
        
        const cookieOptions = { expires: expirationDate };
        
        Cookies.set('token', token, cookieOptions);
        Cookies.set('type', type, cookieOptions);
        Cookies.set('name', name, cookieOptions);
      };

      // Código principal simplificado
      if (res.token && AUTH_CONFIG[res.type]) {
        setAuthCookies(res.token, res.type, res.name);
        navigate(AUTH_CONFIG[res.type]);
      }
  
      if (res.msg) {
        setMsg(res.msg);
        Cookies.remove('token')
        console.log(res.msg);
      }
    }catch(err){
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  };

  /**
   * 
   * @param {*} e.key espera a que presione el enter en ambos text box
   */
  const handleSubmitLogin = (e) => {
    if(e.key=='Enter') {
      verificarLog()
    }
  }

  return (
    <>
      <div className="title justify-items-center items-center content-center min-h-screen mozila-firefox max-sm:p-6">
        <div className="mb-10 text-center">
          <h1 className="font-bold text-4xl text-[#955e37]">Baprosa</h1>
          <h3 className="font-medium text-gray-500">
            Sistema de gestion de bascula
          </h3>
        </div>
        {/* Contenedor del LOGIN */}

        <div className="bg-white p-10 rounded-2xl shadow-2xl">
          <div className="text-center">
            <h1 className="font-semibold text-2xl mb-0.5">Iniciar Sesión</h1>
            <h3 className="text-gray-500">
              Ingrese sus credenciales para acceder al Sistema
            </h3>
          </div>

          <div className="mt-7">
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 ">
                Usuario
              </label>
              <BiUser className="absolute mt-3.5 ml-3.5" />
              <input
                onChange={changeUser}
                onKeyDown={handleSubmitLogin}
                type="usuario"
                id="email"
                className="bg-gray-50 border pl-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#955e37] focus:border-[#955e37] block w-full p-2.5 "
                placeholder="Ingrese su usuario"
                required
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 ">
                Contraseña
              </label>
              <BiLockAlt className="absolute mt-3.5 ml-3.5" />
              <input
                onChange={changeContra}
                onKeyDown={handleSubmitLogin}
                type="password"
                id="contra"
                className="bg-gray-50 border pl-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#955e37] focus:border-[#955e37] block w-full p-2.5 "
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
            {msg && <ModalError vMsg={msg} />}
            <div className="w-full mb-6">
              <button
                onClick={verificarLog}
                type="submit"
                className="text-white bg-[#955e37] hover:bg-[#b4927a] focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando Sessión...' : 'Iniciar Sessión'}
              </button>
            </div>
            <div className="w-full border-amber-200">
              <h3 className="text-gray-600 font-medium text-sm text-center">
                ©2025 Baprosa. Todos los derechos reservados.
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
