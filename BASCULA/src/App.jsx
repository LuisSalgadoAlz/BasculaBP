import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Route } from "react-router";
import Login from "./views/login";

function App() {
  const [data, setData] = useState(0);

  return (
    <>
      <main className="min-h-screen">
        <Login />
      </main>
    </>
  );
}

export default App;
