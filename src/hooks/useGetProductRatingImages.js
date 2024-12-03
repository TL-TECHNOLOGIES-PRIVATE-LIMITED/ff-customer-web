import { useEffect, useState } from 'react';
import api from '../api/api';

const useGetProductRatingImages = (token, product_id, limit, offset) => {
    const [ratingImages, setRatingImages] = useState([]);
    const [totalImages, setTotalImages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const fetchProductRatingById = async () => {
            try {
                const response = await api.getProductRatingImages(token, product_id, limit, offset);
                const result = await response.json();
                setRatingImages(result.data);
                setTotalImages(result.total);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        if (product_id !== undefined) {
            fetchProductRatingById();
        }
    }, [product_id, offset]);

    return { ratingImages, totalImages, loading, error };
};

export default useGetProductRatingImages;    