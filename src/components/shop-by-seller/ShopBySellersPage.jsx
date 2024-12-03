import React, { useEffect, useState } from 'react';
import { setFilterBySeller } from '../../model/reducer/productFilterReducer';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import coverImg from '../../utils/cover-img.jpg';
import useShopBySellers from '../../hooks/useShopBySellers';
import Pagination from 'react-js-pagination';
import Skeleton from 'react-loading-skeleton';
import "./shop-by-seller.css";
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';

const ShopBySellersPage = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const setting = useSelector(state => state.setting);
    const user = useSelector(state => state.user);
    const filter = useSelector(state => state.productFilter);
    const city = useSelector(state => state.city.city);

    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);



    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });

    }, []);

    const { data, totalData, loading, error } = useShopBySellers(user?.jwtToken, city.latitude, city.longitude, limit, offset);

    if (error === "Failed to fetch") {
        return (
            <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                <MdSignalWifiConnectedNoInternet0 />
                <p>{t("no_internet_connection")}</p>
            </div>);
    }

    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };


    const handlePageChange = (pageNo) => {
        setCurrentPage(pageNo);
        setOffset(pageNo * limit - limit);
    };

    const placeholderItems = Array.from({ length: 12 }).map((_, index) => index);
    console.log("total data", totalData)
    return (
        <>
            <section className='allSellersContainer'>
                <div className='cover'>
                    <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                    <div className='page-heading'>
                        <h5>{t("sellers")}</h5>
                        <p><Link to="/" className='text-light text-decoration-none'>{t("home")} /</Link> <span>{t("sellers")}</span></p>
                    </div>
                </div>

                <div className='container' style={{ padding: "30px 0px" }}>
                    {loading ?
                        <div className='row justify-content-center mx-3'>
                            {placeholderItems.map((index) => (
                                <div key={index} className='col-md-3 col-lg-2 col-6 col-sm-3 my-3'>
                                    <Skeleton height={250} />
                                </div>
                            ))
                            }
                        </div>
                        :
                        <div className='row justify-content-center'>
                            {data?.map((seller, index) => (
                                <div className="col-md-3 col-lg-2 col-6 col-sm-3 my-3 content" key={index} onClick={() => {
                                    dispatch(setFilterBySeller({ data: seller?.id }));
                                    navigate('/products');
                                }}>
                                    <div className='card'>
                                        {/* <img onError={placeHolderImage} className='card-img-top' src={seller.logo_url} alt='sellers' loading='lazy' /> */}
                                        <ImageWithPlaceholder className='card-img-top' src={seller.logo_url} alt='sellers' />
                                        <div className='card-body' style={{ cursor: "pointer" }} >
                                            <p>{seller.name} </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    }

                </div>
                {(limit < totalData) &&
                    <Pagination
                        itemClass='sellerListingPagination'
                        activePage={currentPage}
                        itemsCountPerPage={limit}
                        totalItemsCount={totalData}
                        pageRangeDisplayed={5}
                        onChange={handlePageChange.bind(this)}
                    />
                }
            </section>

        </>
    );
};

export default ShopBySellersPage;