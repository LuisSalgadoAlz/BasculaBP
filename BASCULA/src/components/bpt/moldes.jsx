export const WebSocketsMolde = ({ connectionStatus, itsValid, children }) => {
  const renderContent = () => {
    if (connectionStatus === 'error') {
      return (
        <div className="text-center p-4 text-red-600 bg-red-50 rounded-md border border-red-200">
          <p className="font-semibold">Error de conexión</p>
          <p className="text-sm mt-1">SAP no disponible o sin conexión a internet</p>
        </div>
      );
    }

    if (connectionStatus === 'closed') {
      return (
        <div className="text-center p-4 text-yellow-600 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="font-semibold">Conexión cerrada</p>
          <p className="text-sm mt-1">Por favor, actualice la página para reconectar</p>
        </div>
      );
    }

    if (connectionStatus === 'connected') {
      if (itsValid && children) {
        return children;
      }
      
      return (
        <div className="text-center p-6 text-gray-500">
          <p className="text-lg">No hay manifiestos disponibles</p>
        </div>
      );
    }

    return (
      <div className="text-center p-4 text-gray-400">
        <p>Conectando...</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-md">
      {renderContent()}
    </div>
  );
};