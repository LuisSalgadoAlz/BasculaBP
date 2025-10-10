import { useState, useEffect } from "react";
import { ALERTSCOLORS, URLWEBSOCKET } from "../../constants/global";
import { useCallback } from "react";
import { getLastPickingForDocNum, getManifiestosDetalles, getManifiestosDetallesLocal, getManifiestosLogs, getUserForFront, getUsersForManifiestos, postAsignarManifiesto, putPickingStatus } from "./requests";
import { toast } from "sonner";
import { useNavigate } from "react-router";

/**
 *  END - HOOKS DE LOS PICKEROS 
 */
export const useUsers = () => {
  const [user, setUser] = useState()
  const [loadingUser, setLoadingUser] = useState(false)

  const fetchUser = useCallback(() => {
      getUserForFront(setUser, setLoadingUser)
  }, [])

  useEffect(()=> {
      fetchUser()
  }, [fetchUser])

  return { user, loadingUser }
}

export const useManifiestosSocket = () => {
  const DEFINE_URLWEBSOCKET = `${URLWEBSOCKET}/manifiestos`;
  const [manifiestos, setManifiestos] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  useEffect(() => {
    const socket = new WebSocket(DEFINE_URLWEBSOCKET); 
    
    socket.onopen = () => {
      console.log('WebSocket conectado');
      setConnectionStatus('connected');
    };
    
    socket.onmessage = (event) => {
      try {
        const newManifiestos = JSON.parse(event.data);
        if (Array.isArray(newManifiestos)) {
          setManifiestos(newManifiestos);
          setConnectionStatus('connected'); 
        }
      } catch (error) {
        console.error('Error parseando datos:', error);
        setConnectionStatus('error');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    socket.onclose = () => {
      console.log('WebSocket cerrado');
      setConnectionStatus('closed');
    };

    return () => {
      socket.close();
    };
  }, [DEFINE_URLWEBSOCKET]);

  return {
    manifiestos,
    connectionStatus,
  };
}

export const useGetUsersForManifiestos = (setSelectedItems) => {
  const [users, setUsers] = useState([])
  const [laodingUsers, setLoadingUsers] = useState(false)
  const [open, setOpen] = useState(false)
  const [loadingAsignar, setLoadingAsignar] = useState(false)
  const [arrManifiestos, setArrManifiestos] = useState([])

  const fetchData = useCallback(() => {
    getUsersForManifiestos(setUsers, setLoadingUsers)
  }, [])

  const handleChecked = (e, [item]) => {
    const { checked } = e.target;

    setArrManifiestos(prev =>
      checked
        ? [...prev, item] // agrega si está marcado
        : prev.filter(el => el.DocNum !== item.DocNum) // elimina si se desmarca
    );
  };

  const openModalAsignar = () => {
    if(arrManifiestos.length == 0) return toast.error('No hay manifiestos seleccionados.', ALERTSCOLORS.ERROR)
    if(arrManifiestos.length > 10) return toast.error('No se puede asignar más de 5 manifiestos simultaneos.', ALERTSCOLORS.ERROR)
    setOpen(true)
  }


  const handleAsignarMasivamente = async(userId) => {
    if(loadingAsignar) return

    const obj = {
      manifiestos: arrManifiestos,
      usuarioAsignado: userId,
    }

    const response = await postAsignarManifiesto(obj, setLoadingAsignar)
    setOpen(false)
    if(response.err) return toast.error(response.err, ALERTSCOLORS.ERROR)
    if(response.msg) {
      setArrManifiestos([])
      toast.success(response.msg, ALERTSCOLORS.SUCCESS)
      return
    }
  };

  const handleLimpiarSeleccion = () => {
    setSelectedItems(new Set())
    setArrManifiestos([]);
    // Desmarcar todos los checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      if (cb.id !== 'onlyNow') cb.checked = false;
    });
  };
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return { 
    users, 
    laodingUsers, 
    open, 
    setOpen, 
    handleChecked, 
    loadingAsignar, 
    openModalAsignar,
    handleAsignarMasivamente, 
    handleLimpiarSeleccion 
  }
}

export const useManifiestosSocketCanal2 = (DocNum) => {
  const DEFINE_URLWEBSOCKET = `${URLWEBSOCKET}/asignados`;
  const [manifiestosAsignados, setManifiestosAsignados] = useState([]);
  const [connectionStatusAsignados, setConnectionStatusAsignados] = useState('connecting');
  
  useEffect(() => {
    const socket = new WebSocket(DEFINE_URLWEBSOCKET); 
    
    socket.onopen = () => {
      console.log('WebSocket conectado');
      setConnectionStatusAsignados('connected');
    };
    
    socket.onmessage = (event) => {
      try {
        const newManifiestos = JSON.parse(event.data);
        if (Array.isArray(newManifiestos)) {
          setManifiestosAsignados(newManifiestos);
          setConnectionStatusAsignados('connected'); 
        }
      } catch (error) {
        console.error('Error parseando datos:', error);
        setConnectionStatusAsignados('error');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatusAsignados('error');
    };

    socket.onclose = () => {
      console.log('WebSocket cerrado');
      setConnectionStatusAsignados('closed');
    };

    return () => {
      socket.close();
    };
  }, [DEFINE_URLWEBSOCKET]);

  const logsDetector = manifiestosAsignados.find(el => el.DocNum == DocNum)?.logs;

  return {
    manifiestosAsignados,
    connectionStatusAsignados,
    logsDetector, 
  };  
}

export const useVerLogs = () => {
  const [openLogs, setOpenLogs] = useState(false)
  const [selectedLog, setSelectedLog ] = useState(null)
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const handleOpenLogs = async( DocNum ) => {
    setSelectedLog(DocNum)
    const { data } = await getManifiestosLogs(setLogs, setLoadingLogs, DocNum)
    if (data.length === 0){
      toast.error('No hay logs disponibles.', ALERTSCOLORS.ERROR)
      return
    }
    setOpenLogs(true)
  }

  return { openLogs, setOpenLogs, logs, loadingLogs, handleOpenLogs, selectedLog }
}

/**
 * END - HOOKS DE LA VISTA DE PICKEROS
 */
export const useManifiestosAsignados = (user) => {
  const DEFINE_URLWEBSOCKET = `${URLWEBSOCKET}/picking?userId=${user?.idBpt}`;
  const [manifiestos, setManifiestos] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  useEffect(() => {
    if(!user) return
    const socket = new WebSocket(DEFINE_URLWEBSOCKET); 
    
    socket.onopen = () => {
      console.log('WebSocket conectado');
      setConnectionStatus('connected');
    };
    
    socket.onmessage = (event) => {
      try {
        const newManifiestos = JSON.parse(event.data);
        if (Array.isArray(newManifiestos.data)) {
          setManifiestos(newManifiestos.data);
          setConnectionStatus('connected'); 
        }
      } catch (error) {
        console.error('Error parseando datos:', error);
        setConnectionStatus('error');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    socket.onclose = () => {
      console.log('WebSocket cerrado');
      setConnectionStatus('closed');
    };

    return () => {
      socket.close();
    };
  }, [user?.idBpt]);

  return {
    manifiestos,
    connectionStatus,
  };
}

export const useNavigateBack = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1)
  }

  return { handleBack, navigate }
} 

export const useGetManifiestosDetalles = (DocNum) => {
  const [manifiesto, setManifiesto] = useState([]);
  const [loadingManifiesto, setLoadingManifiesto] = useState(false);
  const [manifiestoLocal, setManifiestoLocal] = useState()
  const [loadingManifiestoLocal, setLoadingManifiestoLocal] = useState(false)  
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchDetalles = useCallback(() => {
      getManifiestosDetalles(setManifiesto, setLoadingManifiesto, DocNum);
  }, [DocNum]);

  const fetchDetallesLocal = useCallback(() => {
    getManifiestosDetallesLocal(setManifiestoLocal, setLoadingManifiestoLocal, DocNum)
  }, [DocNum]);

  useEffect(() => {
      fetchDetalles();
  }, [fetchDetalles,]);

  useEffect(()=>{
    fetchDetallesLocal();
  }, [fetchDetallesLocal])


  return {
    manifiesto,
    loadingManifiesto,
    manifiestoLocal,
    loadingManifiestoLocal,
    fetchDetallesLocal,
    menuOpen,
    setMenuOpen,
  }
}

export const useStatePicking = (DocNum, fetchDetallesLocal) => {
  const [userPicking, setUserPicking] = useState()
  const [loadingPicking, setLoadingPicking] = useState(false)

  const fetchPicking = useCallback(() => {
      getLastPickingForDocNum(setUserPicking, setLoadingPicking, DocNum)
  }, [])

  useEffect(() => {
      fetchPicking()
  }, [fetchPicking])

  const STATE_PICKING = {
    START: 'EPK', 
    END: 'FPK'
  }

  const handlePickingStatus = async (estado, type) => {
    const loadingToast = toast.loading('Procesando...');
      
    try {            
        const obj = { estado, type };
        const response = await putPickingStatus(DocNum, obj);
        
        toast.dismiss(loadingToast);
        
        if (response?.err) {
            toast.error(response.err, ALERTSCOLORS.ERROR);
            return false;
        }
        
        if (response?.msg) {
            await fetchPicking();
            await fetchDetallesLocal();
            toast.success(response.msg, ALERTSCOLORS.SUCCESS);
            return true;
        }
        toast.warning('Error inesperado al actualizar el estado, intente denuevo.', ALERTSCOLORS.ERROR);
        return false;
    } catch (error) {
        console.error('Error en picking:', error);
        toast.dismiss(loadingToast);
        toast.error('Error inesperado al actualizar el estado', ALERTSCOLORS.ERROR);
        return false;
    }
  };

  const handleStartPicking = () => handlePickingStatus(STATE_PICKING.START, false);
  const handleFinishPicking = () => handlePickingStatus(STATE_PICKING.END, true);

  return {
    handleStartPicking,
    handleFinishPicking, 
    userPicking,
    loadingPicking
  }
}