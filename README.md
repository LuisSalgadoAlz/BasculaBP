<!-- import { useState, useEffect, use } from "react";

const Dashboard = () => {
  const [peso, setPeso] = useState({});
  const api = async () => {
    const data = await fetch("http://localhost:3000/peso", {
      method : 'GET',
      headers : {
        "Authorization" : window.localStorage.getItem('token')
      }
    });

  useEffect(() => {
    api();
  }, [peso]);

  /* Obtener el peso en limpio seria de la forma tradicional con el forEach eliminar los "" y remplazar el lb por "" */

  return (
    <>
      <div className="justify-center items-center w-screen text-center min-h-screen flex flex-col gap-6">
        <h1 className="text-8xl font-bold">Test</h1>
        <h1 className="mt-2 text-4xl">Actualizando en tiempo real w : {peso.peso}</h1>
        <iframe src="http://192.9.100.186:3000/" width={900} height={700}></iframe>
      </div>
    </>
  );
};

export default Dashboard; -->
