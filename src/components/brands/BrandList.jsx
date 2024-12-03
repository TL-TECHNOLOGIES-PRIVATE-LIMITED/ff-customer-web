import "./brand.css";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import coverImg from '../../utils/cover-img.jpg';
import { useTranslation } from 'react-i18next';
import { setFilterBrands } from "../../model/reducer/productFilterReducer";
import Pagination from 'react-js-pagination';
import useShopByBrands from '../../hooks/useShopByBrands';
import Skeleton from 'react-loading-skeleton';
import { MdSignalWifiConnectedNoInternet0 } from "react-icons/md";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";


const BrandList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const setting = useSelector(state => state.setting);
    const user = useSelector(state => state.user);
    const filter = useSelector(state => state.productFilter);

    const [limit, setLimit] = useState(12);
    const [offset, setOffset] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const { data, totalData, loading, error } = useShopByBrands(user?.jwtToken, limit, offset);

    if (error === "Failed to fetch") {
        return (<div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
            <MdSignalWifiConnectedNoInternet0 />
            <p>{t("no_internet_connection")}</p>
        </div>);
    }
    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };

    const sort_unique_brand_ids = (int_brand_ids) => {
        if (int_brand_ids.length === 0) return int_brand_ids;
        int_brand_ids = int_brand_ids.sort(function (a, b) { return a * 1 - b * 1; });
        var ret = [int_brand_ids[0]];
        for (var i = 1; i < int_brand_ids.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
            if (int_brand_ids[i - 1] !== int_brand_ids[i]) {
                ret.push(int_brand_ids[i]);
            }
        }
        return ret;
    };

    const handlePageChange = (pageNo) => {
        setCurrentPage(pageNo);
        setOffset(pageNo * limit - limit);
    };

    const placeholderItems = Array.from({ length: 12 }).map((_, index) => index);


    return (
        <>

            <section className='allBrandsSlider'  >
                <div className='cover'>
                    <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                    <div className='page-heading'>
                        <h5>{t("brands")}</h5>
                        <p><Link to="/" className='text-light text-decoration-none'>{t("home")} /</Link> <span>{t("brands")}</span></p>
                    </div>
                </div>

                <div className='container' style={{ padding: "30px 0" }}>
                    {loading ?
                        <div className='row justify-content-center mx-3'>
                            {placeholderItems.map((index) => (
                                <div key={index} className='col-md-3 col-lg-2 col-6 col-sm-3 my-3'>
                                    <Skeleton height={250} />
                                </div>
                            ))}
                        </div>
                        :
                        <div className='row justify-content-center mx-3'>
                            {data?.map((ctg, index) => (
                                <div className="col-md-3 col-lg-2 col-6 col-sm-3 my-3 content" key={index} onClick={() => {

                                    // setSelectedBrands((prev) => [...prev, ...brand.id])
                                    var brand_ids = [...filter.brand_ids];

                                    if (brand_ids.includes(ctg.id)) {
                                        brand_ids.splice(ctg.indexOf(ctg.id), 1);
                                    }
                                    else {
                                        brand_ids.push(parseInt(ctg.id));
                                    }

                                    const sorted_brand_ids = sort_unique_brand_ids(brand_ids);
                                    dispatch(setFilterBrands({ data: sorted_brand_ids }));
                                    navigate('/products');
                                }}>

                                    <div className='card'>
                                        {/* <img onError={placeHolderImage} className='card-img-top' src={ctg.image_url} alt='' loading='lazy' /> */}
                                        <ImageWithPlaceholder className='card-img-top' src={ctg.image_url} alt='brandImage' />
                                        <div className='card-body' style={{ cursor: "pointer" }} >
                                            <p>{ctg.name} </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    }

                    {(limit < totalData) &&
                        <Pagination
                            itemClass="brandListingPagination"
                            activePage={currentPage}
                            itemsCountPerPage={limit}
                            totalItemsCount={totalData}
                            pageRangeDisplayed={5}
                            onChange={handlePageChange.bind(this)}
                        />
                    }
                </div>
            </section>
        </>

    );

};

export default BrandList;
