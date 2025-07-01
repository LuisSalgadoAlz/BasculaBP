import { lazy, Suspense } from "react";
import { BigSpinner } from "../components/alerts";

const Calendario = lazy(() =>
  import("../components/calendario/calendario").then((module) => ({
    default: module.Calendario, // <-- aquí se indica cuál export nombrado usar
  }))
);

const CalendarioView = () => {
  return (
    <>
      <div className="flex justify-between w-full gap-5">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Calendario</h1>
          <h1 className="text-gray-600">
            {" "}
            Visualización general del mes de las boletas
          </h1>
        </div>
      </div>
      <div className="mt-6 bg-white shadow rounded-lg px-6 py-7 border border-gray-300 max-h-[700px] overflow-auto body-components calendario">
        <Suspense fallback={<BigSpinner />}>
          <Calendario />
        </Suspense>
      </div>
    </>
  );
};

export default CalendarioView;
