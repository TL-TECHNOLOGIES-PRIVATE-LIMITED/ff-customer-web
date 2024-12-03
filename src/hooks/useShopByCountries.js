import { useState, useEffect } from 'react';
import api from '../api/api';

const useShopByCountries = (token, limit, offset) => {
    const [data, setData] = useState(null);
    const [totalData, setTotalData] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShopByCountriesData = async () => {
            setLoading(true);
            try {
                const response = await api.getShopByCountries(token, limit, offset);
                const result = await response.json();
                setTotalData(result.total);
                setData(result.data);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        fetchShopByCountriesData();
    }, [offset]);

    return { data, totalData, loading, error };
};

export default useShopByCountries;