import { Children } from "react";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

// Define los componentes Buttons y Cuerpo
export const Buttons = ({ children }) => {
    return <>{children}</>;
};

export const Cuerpo = ({ children }) => {
    return <>{children}</>;
};

export const BaseHeader = ({ title, subtitle, children }) => {
    // Separar Buttons y Cuerpo de otros children
    let buttonsContent = null;
    let cuerpoContent = null;
    let otherChildren = [];

    Children.forEach(children, (child) => {
        if (child?.type === Buttons) {
            buttonsContent = child;
        } else if (child?.type === Cuerpo) {
            cuerpoContent = child;
        } else {
            otherChildren.push(child);
        }
    });

    return ( 
        <>
            <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
                <div className="parte-izq">
                    <h1 className="text-3xl font-bold titulo max-sm:text-xl">
                        {title}
                    </h1>
                    <p className="text-gray-600 max-sm:text-sm">
                        {subtitle}
                    </p>
                </div>
                <div className="parte-der">
                    {buttonsContent}
                </div>
            </div>
            {cuerpoContent}
            {otherChildren}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#333',
                        color: 'white',
                    },
                }}
            />
        </> 
    );
}

export const DataContainer = ({ 
    loading, 
    data, 
    children, 
    loadingMessage = "Cargando...",
    emptyMessage = "No hay datos disponibles",
    className = "bg-white rounded-md shadow-2xl"
}) => {
    return (
        <div className={className}>
            {loading ? (
                <div className="p-8 text-center">
                    <p className="text-gray-500">{loadingMessage}</p>
                </div>
            ) : data && (Array.isArray(data) ? data.length !== 0 : data) ? (
                children
            ) : (
                <div className="p-8 text-center">
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            )}
        </div>
    );
};


export const DataLoading = ({ 
    loading, 
    loadingMessage = "Cargando...", 
    children,
    minHeight = "200px",
    showSpinner = true 
}) => {
    if (loading) {
        return (
            <div 
                className="flex flex-col items-center justify-center p-8 text-center"
                style={{ minHeight }}
            >
                {showSpinner && (
                    <Loader2 className="w-8 h-8 mb-3 text-[#5a3f27] animate-spin" />
                )}
                <p className="text-gray-600 font-medium">{loadingMessage}</p>
            </div>
        );
    }

    return children;
};