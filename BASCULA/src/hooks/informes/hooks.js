import { useCallback, useEffect, useState } from "react";
import { getHistoricoViajes, getStatsSilosForBuques, getUsers } from '../../hooks/informes/tolva';
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