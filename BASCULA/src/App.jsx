import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [data, setData] = useState(0)

  const consumoApi = async () => {
    const data = JSON.stringify({
      usuarios: "usuario creado desde react",
      contrasena: "ver"
    })

    const res = await fetch('http://localhost:3000/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })
    const json = await res.json()
    console.log(json)

    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
  
  }

  const handleClick = () => {
    consumoApi();
  }

  return (
    <>
      <button onClick={handleClick}>Consumir</button>
    </>
  )
}

export default App
