import React, { useRef, useEffect } from 'react';
import './category.css';
import api from '../../api/api';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { ActionTypes } from '../../model/action-type';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { setCategory, setSelectedCategory } from '../../model/reducer/categoryReducer';
import { clearAllFilter, setFilterCategory } from '../../model/reducer/productFilterReducer';
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const Category = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const shop = useSelector(state => state.shop);
    const category = shop && shop?.shop?.categories;

    const selectCategory = (category) => {
        dispatch(clearAllFilter())
        dispatch(setFilterCategory({ data: category.id }));
        if (category?.has_child === true) {
            navigate(`/category/${category.slug}`);
            dispatch(setSelectedCategory(category));
            // navigate(`/category/${category.slug}`, { state: { categoryName: category.name } });
        } else {
            navigate('/products');
        }
    };

    return (
        <>
            {(category && (category?.length > 0))
                ?
                <>
                    <div className=" category_section_header">
                        <div className='row'>
                            <div className="col-md-12 col-12 d-flex justify-content-between align-items-center p-0">
                                <div className="title d-md-flex align-items-center ">
                                    <p>{t('shop_by')} {t('categories')}</p>
                                    {/* <Link className='d-none d-md-block' to='/category/all'>{t('see_all')} {t('categories')}<AiOutlineArrowRight size={15} className='see_category_arrow' /> </Link> */}
                                </div>
                                <div className=' d-md-none'>
                                    {/* <Link className='category_button' to='/category/all'>{t('see_all')}</Link> */}
                                </div>
                                <div className='d-flex align-items-center'>
                                    {

                                        category?.length > 5 ? <div className=" justify-content-end align-items-ceneter d-md-flex d-none">
                                            <Link className='category_button' to='/category/all'>{t('see_all')}</Link>
                                            <button className='prev-arrow-category prev-arrow-cat' ><IoMdArrowBack fill='black' size={20} /></button>
                                            <button className='next-arrow-category next-arrow-cat' ><IoMdArrowForward fill='black' size={20} /></button>
                                        </div> : <></>
                                    }
                                </div>


                            </div>
                        </div>

                    </div>
                    <div className="caegory_section_content row">

                        <div className='' id="expandCategory">
                            <Swiper modules={[Navigation, Pagination]}
                                navigation={{
                                    prevEl: '.prev-arrow-cat',
                                    nextEl: '.next-arrow-cat',
                                }}

                                pagination={{ clickable: true }}
                                breakpoints={{
                                    1200: {
                                        slidesPerView: 6,
                                        spaceBetween: 15,
                                    },
                                    1024: {
                                        slidesPerView: 4,
                                        spaceBetween: 15,
                                    },
                                    768: {
                                        slidesPerView: 3,
                                        spaceBetween: 15,
                                    },

                                    300: {
                                        slidesPerView: 2,
                                        spaceBetween: 10,
                                    },
                                }}>
                                {
                                    category?.map((ctg, index) => (
                                        <div className="col-md-12" key={index}>
                                            <SwiperSlide className='category-container' key={index}>
                                                {ctg.has_child
                                                    ? (
                                                        <Card onClick={() => selectCategory(ctg)}>
                                                            <div className='category-main-img'>
                                                                <ImageWithPlaceholder src={ctg.image_url} alt={ctg.subtitle} className={'card-img-top category_image'} />
                                                            </div>
                                                            {/* <Card.Img onError={placeHolderImage} variant='top' src={ctg.image_url} alt={ctg.subtitle} className='card-img-top category_image' /> */}

                                                            <Card.Body className='card-body'>
                                                                <Card.Title className="card-title">{ctg.name}</Card.Title>
                                                            </Card.Body>
                                                        </Card>
                                                    )
                                                    : (
                                                        <Card onClick={() => selectCategory(ctg)}>
                                                            <div className='category-main-img'>
                                                                <ImageWithPlaceholder src={ctg.image_url} alt={ctg.subtitle} className={'card-img-top category_image'} />
                                                            </div>
                                                            {/* <Card.Img onError={placeHolderImage} variant='top' src={ctg.image_url} alt={ctg.subtitle} className='card-img-top category_image' /> */}
                                                            <Card.Body className='card-body'>
                                                                <Card.Title className="card-title">{ctg.name}</Card.Title>
                                                            </Card.Body>
                                                        </Card>

                                                    )}
                                            </SwiperSlide>

                                        </div>
                                    ))
                                }
                            </Swiper>
                        </div>
                    </div>
                </>
                : null}
        </>
    );
};

export default Category;
