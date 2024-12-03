import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import api from '../../api/api';
import useGetProductRatingImages from '../../hooks/useGetProductRatingImages';
import "./all-rating-images.css";
import Loader from '../loader/Loader';
import Pagination from 'react-js-pagination';
import LightBox from '../lightbox/LightBox';

const AllRatingImages = () => {

    const { slug } = useParams();
    const { t } = useTranslation();

    const city = useSelector(state => state.city);
    const setting = useSelector(state => state.setting);
    const user = useSelector(state => state.user);

    const [currPage, setCurrPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [offset, setOffset] = useState(0);
    const [productId, setProductId] = useState(0);
    const [product, setProduct] = useState("");
    const [lightBoxImages, setLightBoxImages] = useState([]);
    const [open, setOpen] = useState(false);
    const [currImageIndex, setCurrImageIndex] = useState(-1);


    const handleImageClick = (images, imageIndex) => {
        setLightBoxImages(images.map((image) => ({ src: image?.image_url ? image?.image_url : image })));
        setCurrImageIndex(imageIndex);
        setOpen(true);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const getProductData = async () => {

            await api.getProductbyFilter(city.city?.latitude, city.city?.longitude, { slug: slug }, user?.jwtToken)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        setProduct(result?.data?.[0]);
                        setProductId(result?.data?.[0].id);
                    }
                    else {
                    }
                })
                .catch(error => console.log(error));
        };
        getProductData();
    }, [slug]);

    const { ratingImages, totalImages, loading } = useGetProductRatingImages(user?.jwtToken, productId, limit, offset);

    const handlePageChange = (pageNum) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrPage(pageNum);
        setOffset(pageNum * limit - limit);
    };

    return (
        <>
            <h5 className="ms-5 mt-5 allImagesTitle">{t("all_customer_photos")}</h5>
            <section id='all-ratings-images' className='d-flex row justify-content-center m-5'>
                {loading ?
                    <Loader width={"100%"} height={"500px"} />
                    : null}
                {(ratingImages?.length !== 0 && !loading) ?
                    <div className='d-flex flex-row flex-wrap justify-content-center allRatingImagesContainer my-4'>
                        {ratingImages?.map((image, index) => (
                            <div key={`${image}-${index}`}
                                onClick={() => {
                                    handleImageClick(ratingImages, index);
                                }}>
                                <img src={image} alt='ratingImg' className='cursorPointer' loading='lazy' />
                            </div>
                        ))}
                        <LightBox imageIndex={currImageIndex} open={open} setOpen={setOpen} images={lightBoxImages} />
                    </div>
                    : null}
                {(limit < totalImages) ? < Pagination
                    activePage={currPage}
                    itemsCountPerPage={limit}
                    totalItemsCount={totalImages}
                    pageRangeDisplayed={5}
                    onChange={handlePageChange.bind(this)}
                /> : null}
            </section>
        </>
    );
};

export default AllRatingImages;