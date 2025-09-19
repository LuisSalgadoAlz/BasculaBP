import { useCallback, useEffect, useState } from "react";
import { getInfoSilosDetailsV2, getInfoSilosV2, getStatsSilosForBuques, getUsers, postCreateNewReset } from '../../hooks/informes/tolva';
import { getDataForSelect } from '../../hooks/informes/granza';

export const useFilters = () => {
    const initFilterHistorico = {userInit_historico: '', userEnd_historico: '', state_historico: '', search_historico: ''}
    const [selected, setBuqueSelected] = useState({ typeImp: 2, buque: '' })

    const handleChangeFilters = (e) => {  
        const { name, value } = e.target;
        setBuqueSelected((prev) => {
            if (name === 'typeImp') {
                return {
                typeImp: value,
                buque: '',
                facturasImp: '', 
                };
            }
            
            if (name === 'buque') {
                return {
                ...prev,
                buque: value,
                facturasImp: '', 
                };
            }
            
            return {
                ...prev,
                [name]: value,
            };
        });
    };

    return {
        initFilterHistorico,
        selected,
        setBuqueSelected,
        handleChangeFilters,
    };
}

export const useUsers = () => {
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(false);

  const fetchUsers = useCallback(() => {
    getUsers(setUser, setLoadingUser);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    user,
    loadingUser,
    fetchUsers
  };
};

export const useBuquesData = (selected) => {
  const [buques, setBuques] = useState({ sociosImp: [], facturasImp: [] });
  const [isLoadingBuques, setIsLoadingBuques] = useState(false);

  const fetchBuques = useCallback(() => {
    getDataForSelect(setBuques, setIsLoadingBuques, selected);
  }, [selected]);

  useEffect(() => {
    fetchBuques();
  }, [fetchBuques]);

  return {
    buques,
    isLoadingBuques,
    fetchBuques
  };
};

export const useTolvaStats = () => {
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = useCallback((buque = '', facturasImp = '') => {
    getStatsSilosForBuques(setStats, setLoadingStats, buque, facturasImp);
  }, []);

  const refreshStats = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    loadingStats,
    setLoadingStats,
    setStats,
    fetchStats,
    refreshStats
  };
};

export const useNivelSilos = () => {
  const [nivelSilos, setNivelSilos] = useState([]);
  const [loadingNivelSilos, setLoadingNivelSilos] = useState(false);

  const fetchNivelSilos = useCallback(()=> {
    getInfoSilosV2(setNivelSilos, setLoadingNivelSilos);
  }, []);

  useEffect(() => {
    fetchNivelSilos();
  }, [fetchNivelSilos])

  const handleUpdateBar = () => {
    fetchNivelSilos()
  }
  
  return {
    nivelSilos,
    loadingNivelSilos,
    setLoadingNivelSilos,
    setNivelSilos,
    handleUpdateBar,
    fetchNivelSilos,
  }
}

export const useDetailsSilos = () => {
  const [details, setDetails] = useState()
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [openSheet, setOpenSheet] = useState(false)
  const [selectedSilos, setSelectedSilos] = useState([])

  const handleClickBar = (data) => {
    const siloData = data.activePayload[0].payload;
    console.log(siloData)
    getInfoSilosDetailsV2(setDetails, setLoadingDetails, siloData.siloID)
    setSelectedSilos(siloData?.silo_nombre)
    setOpenSheet(true) 
  }

  const sheetProps = {
    openSheet, 
    setOpenSheet, 
    tableData: details?.data,
    title: 'Detalles Silo', 
    subtitle: `Visualización de boletas ingresadas al silo: ${loadingDetails? 'Cargando...' : selectedSilos}`, 
    type: true,
    fixedColumns: ['#', 'numBoleta', 'placa', 'pesoNeto', 'pesoAcumulado', 'socio'], 
    storageKey: 'tolva-details', 
    isLoading: loadingDetails, 
    labelActive: false,
    detailsSilo: true,
    diferencia: details?.diff,
    inventarioInicial : details?.diff,
    boletas : details?.total,
    parteVacia: 8000,
  }

  return {
    handleClickBar,
    details,
    loadingDetails,
    setLoadingDetails,
    setDetails,
    openSheet,
    setOpenSheet,
    selectedSilos,
    setSelectedSilos,
    sheetProps,
  }
}

export const useActionBarView = () => {
  const [barView, setBarView] = useState(true)
  
  const viewBar1 = () => {
    setBarView(true)
  }
  const viewBar2 = () => {
    setBarView(false)
  }

  return { barView, viewBar1, viewBar2 }
}

export const useResetSilos = (fetchNivelSilos) => {
  const [loadingReset, setLoadingReset] = useState(false);
  
  const handleResetSilo = async (name) => {
    const cuerpoSilo = { silo: name };
    const response = await postCreateNewReset(cuerpoSilo, setLoadingReset);
    fetchNivelSilos();
  };

  return { handleResetSilo, loadingReset }
}