import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';
import { clearAllFilter, setFilterBySeller } from '../../model/reducer/productFilterReducer';
import "./shop-by-seller.css";
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io';

const ShopBySellers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const shop = useSelector(state => state.shop);
    const setting = useSelector(state => state.setting);

    const swiperRef = useRef(null);

    const handlePrevClick = () => {
        if (swiperRef.current) swiperRef.current.swiper.slidePrev();
    };

    const handleNextClick = () => {
        if (swiperRef.current) swiperRef.current.swiper.slideNext();
    };

    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };

    const handleSellerFilter = (id) => {
        dispatch(clearAllFilter);
        dispatch(setFilterBySeller({ data: id }));
        navigate('/products');
    }

    return (
        <>
            {(shop?.shop?.is_seller_section_in_homepage && (shop?.shop?.sellers?.length > 0)) ?
                <section id='all-sellers'>
                    <div className="row seller_section_header">
                        <div className="col-md-12 col-12 d-flex justify-content-between align-items-center p-0">
                            <div className="title d-md-flex align-items-center ">
                                <p>{t('shop_by')} {t('sellers')}</p>
                                {/* <Link className='d-none d-md-block' to='/sellers'>{t('see_all')} {t('sellers')}<AiOutlineArrowRight size={15} className='see_sellers_arrow' /> </Link> */}
                            </div>
                            {/* <div className=' d-md-none'>
                                <Link className='seller_button' to='/sellers'>{t('see_all')}</Link>
                            </div> */}
                            <div className='d-flex align-items-center'>
                                {

                                    shop.shop?.sellers?.length > 5 ? <div className=" justify-content-end align-items-ceneter d-md-flex d-none">
                                        <Link className='category_button' to='/category/all'>{t('see_all')}</Link>
                                        <button className='prev-arrow-category' ><IoMdArrowBack fill='black' size={20} /></button>
                                        <button className='next-arrow-category' ><IoMdArrowForward fill='black' size={20} /></button>
                                    </div> : <></>
                                }
                            </div>

                        </div>
                    </div>
                    <div className='row justify-content-center home allSellersContainer'>
                        <Swiper
                            modules={[Navigation]}
                            navigation={{
                                prevEl: '.prev-arrow-seller',
                                nextEl: '.next-arrow-seller',
                            }}
                            spaceBetween={30}
                            slidesPerView={5}
                            breakpoints={{
                                1200: {
                                    slidesPerView: 4,
                                    spaceBetween: 20,
                                },
                                1024: {
                                    slidesPerView: 4,
                                    spaceBetween: 20,
                                },
                                768: {
                                    slidesPerView: 3,
                                    spaceBetween: 15,
                                },
                                300: {
                                    slidesPerView: 2,
                                    spaceBetween: 10,
                                },
                            }}
                            ref={swiperRef}
                        >
                            {shop.shop?.sellers?.map((seller, index) => (
                                <SwiperSlide key={index}>
                                    <div className="my-3 content" onClick={() => handleSellerFilter(seller?.id)}>
                                        <div className='card d-flex flex-column flex-sm-row'>
                                            <ImageWithPlaceholder className='card-img-top' src={seller.logo_url} alt='country' />
                                            {/* <div className='card-body' style={{ cursor: "pointer" }}> */}
                                            <p>{seller.store_name} </p>
                                            {/* </div> */}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section> : null}
        </>
    );
};

export default ShopBySellers;

{/* <div className='card'>
                                            <ImageWithPlaceholder className='card-img-top' src={seller.logo_url} alt='country' />
                                            <div className='card-body' style={{ cursor: "pointer" }}>
                                                <p>{seller.store_name} </p>
                                            </div>
                                        </div> */}
