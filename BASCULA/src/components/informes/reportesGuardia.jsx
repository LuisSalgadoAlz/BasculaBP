import { lazy, Suspense} from "react";
import { BigSpinner } from "../alerts";

const CalendarioPases = lazy(() =>
  import("../calendario/calendarioPases").then((module) => ({
    default: module.CalendarioPases, // <-- aquí se indica cuál export nombrado usar
  }))
);

const ReportesGuardia = () => {
    return ( 
        <>
            <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
                <div className="parte-izq">
                    <h1 className="text-3xl font-bold titulo">Guardia</h1>
                    <h1 className="text-gray-600 max-sm:text-sm">
                        {" "}
                        Análisis detallado de salidas de vehiculos
                    </h1>
                </div>
            </div>
            <div className="mt-6 bg-white shadow rounded-lg px-6 py-7 border border-gray-300 max-h-[700px] overflow-auto body-components calendario">
                <Suspense fallback={<BigSpinner />}>
                    <CalendarioPases />
                </Suspense>
            </div>
        </>
    );
}
 
export default ReportesGuardia;