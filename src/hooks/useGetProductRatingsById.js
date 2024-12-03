import { useEffect, useState } from 'react';
import api from '../api/api';

const useGetProductsRatingById = (token, product_id, limit, offset) => {
    const [productRating, setProductRating] = useState(null);
    const [totalData, setTotalData] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const fetchProductRatingById = async () => {
            try {
                const response = await api.getProductRatings(token, product_id, limit, offset);
                const result = await response.json();
                setProductRating(result.data);
                setTotalData(result.total);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        if (product_id !== undefined) {
            fetchProductRatingById();
        }
    }, [product_id, offset]);

    return { productRating, totalData, loading, error };
};

export default useGetProductsRatingById;