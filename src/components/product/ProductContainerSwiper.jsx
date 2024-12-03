import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as newApi from "../../api/apiCollection"
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './product.css';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { setProductSizes } from "../../model/reducer/productSizesReducer";
import { clearAllFilter, setFilterCategory, setFilterSection, setFilterSort } from '../../model/reducer/productFilterReducer';
import Loader from '../loader/Loader';
import 'react-loading-skeleton/dist/skeleton.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from './ProductCard';


const ProductContainer = React.memo(({ section, index }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { cssmode } = useSelector(state => state.cssmode)

    const shop = useSelector(state => state.shop);
    const [promotionImage, setPromotionImage] = useState(null)
    useEffect(() => {
        const promotionImageBelowSection = shop?.shop?.offers?.filter((offer) => offer?.position == "below_section");
        const image = promotionImageBelowSection?.filter((offer) => {
            return offer?.section?.title == section?.title
        })
        setPromotionImage(image)
    }, [section])

    const handleViewMore = () => {
        dispatch(setFilterCategory({ data: section?.category_ids }));
        dispatch(setFilterSection({ data: section?.id }))
        navigate("/products")
    }

    return (
        <>
            {section?.products?.length > 0 ?
                <section id="products" style={cssmode == "dark" ?
                    section?.background_color_for_dark_theme != "" ? { backgroundColor: section?.background_color_for_dark_theme } :
                        { backgroundColor: "var(--body-background-color)" }
                    :
                    section?.background_color_for_light_theme != "" ?
                        { backgroundColor: section?.background_color_for_light_theme } :
                        { backgroundColor: "var(--body-background-color)" }
                }>
                    <div className="container">
                        <>
                            <div >
                                <div className='product_section row flex-column' >
                                    <div className="d-flex product_title_content justify-content-between align-items-center col-md-12">
                                        <div >
                                            <div className="product-title-content-container">
                                                <h2>{section.title?.length > 50 ? section.title?.substring(0, 50) + "..." : section.title}</h2>
                                                <p className=' d-md-block'>{section.short_description?.lenght > 70 ? section.short_description?.substring(0, 70) + "..." : section.short_description}</p>
                                            </div>
                                        </div>
                                        {section?.products?.length > 5 ? <div className='d-flex align-items-center flex-md-row flex-column'>
                                            <div>
                                                <span className="d-flex" onClick={() => {
                                                    handleViewMore()
                                                }}>{t('see_all')}</span>
                                            </div>
                                            <div className='d-flex'>
                                                <button className={` prev-arrow-section prev-arrow-section-${index}`}><IoMdArrowBack fill='black' size={20} /></button>
                                                <button className={` next-arrow-section next-arrow-section-${index}`}><IoMdArrowForward fill='black' size={20} /></button>
                                            </div>
                                        </div> : null}


                                    </div>

                                    <div className="product_section_content ">
                                        <Swiper
                                            modules={[Navigation, Pagination]}
                                            navigation={{
                                                prevEl: `.prev-arrow-section-${index} `,
                                                nextEl: `.next-arrow-section-${index}`,
                                            }}

                                            pagination={{ clickable: true }}
                                            breakpoints={{
                                                1200: {
                                                    slidesPerView: 5,
                                                    spaceBetween: 10
                                                },
                                                1024: {
                                                    slidesPerView: 4.5,
                                                    spaceBetween: 10
                                                },
                                                768: {
                                                    slidesPerView: 3.5,
                                                    spaceBetween: 10
                                                },
                                                500: {
                                                    slidesPerView: 2,
                                                    spaceBetween: 10
                                                },
                                                300: {
                                                    slidesPerView: 1.5,
                                                    spaceBetween: 10
                                                },
                                            }}>
                                            {section?.products?.map((product, index) => (
                                                <SwiperSlide key={index}>

                                                    <ProductCard product={product} />

                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>


                                </div>

                            </div>
                        </>
                    </div>
                </section >
                : null}
            {promotionImage?.map((offer) => (
                <div className='col-md-12  col-12 container promotion-img' key={offer?.id} onClick={() => {
                    if (offer?.category) {
                        dispatch(setFilterCategory({ data: offer?.category?.id.toString() }));
                        navigate("/products");
                    } else if (offer?.product) {
                        navigate(`/product/${offer.product.slug}`);
                    } else if (offer?.offer_url) {
                        window.open(offer?.offer_url, "_blank");
                    }
                }}>
                    <img className={`offerImages ${offer?.category ? "cursorPointer" : ""} ${offer?.product ? "cursorPointer" : ""} ${offer?.offer_url ? "cursorPointer" : ""}`} src={offer.image_url} alt="offers" />
                </div>
            ))}
        </>
    );
});

export default ProductContainer;