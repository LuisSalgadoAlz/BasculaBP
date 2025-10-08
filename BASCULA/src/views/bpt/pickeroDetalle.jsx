import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ActionsButtones, ProductosAgrupadosTable } from "../../components/bpt/pickeroComponents";
import { getManifiestosDetalles } from "../../hooks/bpt/requests";

const PickeroDetalleManifiesto = () => {
    const { DocNum } = useParams();
    const navigate = useNavigate();
    const [manifiesto, setManifiesto] = useState([]);
    const [loadingManifiesto, setLoadingManifiesto] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const fetchDetalles = useCallback(() => {
        getManifiestosDetalles(setManifiesto, setLoadingManifiesto, DocNum);
    }, [DocNum]);

    useEffect(() => {
        fetchDetalles();
    }, [fetchDetalles]);

    const handleBack = () => {
        navigate(-1)
    }

    return (
        <>
            <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
                <div className="parte-izq">
                    <h1 className="text-3xl font-bold titulo max-sm:text-xl">
                        Manifiesto {DocNum}
                    </h1>
                    <h1 className="text-gray-600 max-sm:text-sm">
                        Visualización del picking.
                    </h1>
                </div>
                <div className="parte-izq flex gap-2">
                    <ActionsButtones handleBack={handleBack} setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
                </div>
            </div>
            <div className="bg-white rounded-md shadow-2xl">
                {loadingManifiesto ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">Cargando detalles...</p>
                    </div>
                ) : manifiesto && manifiesto.length !== 0 ? (
                    <ProductosAgrupadosTable tableData={manifiesto} />
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No hay datos disponibles</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default PickeroDetalleManifiesto;