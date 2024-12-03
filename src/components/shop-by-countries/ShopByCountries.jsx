import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { clearAllFilter, setFilterByCountry } from '../../model/reducer/productFilterReducer';
import "./shop-by-countries.css";
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io';

const ShopByCountries = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const shop = useSelector(state => state.shop);
    const setting = useSelector(state => state.setting);

    const handleCountryFilter = (id) => {
        dispatch(clearAllFilter())
        dispatch(setFilterByCountry({ data: id }));
        navigate('/products');
    }

    return (
        <>
            {(shop?.shop?.is_country_section_in_homepage && (shop?.shop?.countries?.length > 0)) ?
                <section id='all-countries'>
                    <div className=" countries_section_header">
                        <div className='row'>
                            <div className="col-md-12 col-12 d-flex justify-content-between align-items-center p-0">
                                <div className="title d-md-flex align-items-center ">
                                    <p>{t('shop_by')} {t('countries')}</p>
                                    {/* <Link className='d-none d-md-block' to='/countries'>{t('see_all')} {t('countries')}<AiOutlineArrowRight size={15} className='see_countries_arrow' /> </Link> */}
                                </div>
                                {/* <div className=' d-md-none'>
                                    <Link className='country_button' to='/countries'>{t('see_all')}</Link>
                                </div> */}
                                <div className='d-flex align-items-center'>
                                    {

                                        shop.shop?.countries?.length > 5 ? <div className=" justify-content-end align-items-ceneter d-md-flex d-none">
                                            <Link className='category_button' to='/countries'>{t('see_all')}</Link>
                                            <button className='prev-arrow-country' ><IoMdArrowBack fill='black' size={20} /></button>
                                            <button className='next-arrow-country' ><IoMdArrowForward fill='black' size={20} /></button>
                                        </div> : <></>
                                    }
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className='row justify-content-center home allCountriesContainer'>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation={{
                                prevEl: '.prev-arrow-country',
                                nextEl: '.next-arrow-country',
                            }}
                            pagination={{ clickable: true }}
                            breakpoints={{
                                1200: {
                                    slidesPerView: 5,
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
                        >
                            {shop.shop?.countries?.map((country, index) => (
                                <SwiperSlide key={index}>
                                    <div className="my-3 content" onClick={() => handleCountryFilter(country?.id)}>
                                        <div className='card'>
                                            <ImageWithPlaceholder
                                                className='card-img-top'
                                                src={`${process.env.REACT_APP_API_URL}/storage/${country.logo}`}
                                                alt='sellers'
                                            />
                                            <div className='card-body' style={{ cursor: "pointer" }} >
                                                <p>{country.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>
                : null}
        </>
    );
};

export default ShopByCountries;