import { useEffect, useState } from 'react';
import api from '../api/api';

const useShopBySellers = (token, latitude, longitude, limit, offset) => {
    const [data, setData] = useState(null);
    const [totalData, setTotalData] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShopBySellersData = async () => {
            setLoading(true);
            try {
                const response = await api.getShopBySellers(token, latitude, longitude, limit, offset);
                const result = await response.json();
                setTotalData(result.total);
                setData(result.data);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        fetchShopBySellersData();
    }, [offset]);

    return { data, totalData, loading, error };
};

export default useShopBySellers;