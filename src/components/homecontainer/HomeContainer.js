import React, { useEffect, useState } from 'react';
import Category from '../category/Category';
import Slider from '../sliders/Slider';
import './homecontainer.css';
import { useDispatch, useSelector } from 'react-redux';
import Brand from '../brands/Brand';
import ShopByCountries from '../shop-by-countries/ShopByCountries';
import ShopBySellers from '../shop-by-seller/ShopBySellers';
import { useNavigate } from 'react-router-dom';
import { setFilterCategory } from '../../model/reducer/productFilterReducer';
import HorizontalProductContainer from '../product/horizontalProductContainer';
import VerticaleProductContainer from '../product/VerticaleProductContainer';
import ProductSwiperWithImage from '../product/ProductSwiperWithImage';
import ProductContainer from '../product/ProductContainerSwiper';

const HomeContainer = ({ OfferImagesArray, BelowSliderOfferArray, BelowCategoryOfferArray }) => {
    const shop = useSelector((state) => state.shop);
    const { cssmode } = useSelector(state => state.cssmode)
    const dispatch = useDispatch();
    const navigate = useNavigate();



    const aboveHomeSection = shop?.shop?.sections?.filter((section) => section?.position == "top");
    const belowHomeSliderSection = shop?.shop?.sections?.filter((section) => section?.position == "below_slider");
    const belowCategorySection = shop?.shop?.sections?.filter((section) => section?.position == "below_category");
    const belowBrandsSection = shop?.shop?.sections?.filter((section) => section?.position == "custom_below_shop_by_brands");
    const belowCoutrySection = shop?.shop?.sections?.filter((section) => section?.position == "below_shop_by_country_of_origin");
    const belowShopSellerSection = shop?.shop?.sections?.filter((section) => section?.position == "below_shop_by_seller");

    return (
        <section id="home" className='home-section  home-element section'>
            {/* <div className='container'> */}
            {OfferImagesArray?.map((offer) => (
                <div className='col-md-12 col-12 container promotion-img' key={offer?.id} onClick={() => {
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
            {aboveHomeSection?.map((section, index) => {
                if (section?.style_web == "style_1") {
                    return (<ProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_2") {
                    return (<VerticaleProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_3") {
                    return (<HorizontalProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_4") {
                    return (<ProductSwiperWithImage section={section} index={index} />)
                }
            })}
            <div className='home-container row mx-5'>
                <div className="col-md-12 p-0 col-12">
                    <Slider />
                </div>
            </div>
            {BelowSliderOfferArray?.map((offer) => (
                <div className='col-md-12 p-0 col-12 my-3 my-md-5 container' key={offer?.id} onClick={() => {
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
            {belowHomeSliderSection?.map((section, index) => {
                if (section?.style_web == "style_1") {
                    return (<ProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_2") {
                    return (<VerticaleProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_3") {
                    return (<HorizontalProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_4") {
                    return (<ProductSwiperWithImage section={section} index={index} />)
                }
            })}
            {shop.shop?.is_category_section_in_homepage ?
                <div className='category_section_category'>
                    <div className="container">
                        <Category />
                    </div>
                </div>
                : <></>}
            {BelowCategoryOfferArray?.map((offer) => (
                <div className='col-md-12 p-0 col-12 my-3 my-md-5 container' key={offer?.id} onClick={() => {
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
            {belowCategorySection?.map((section, index) => {
                if (section?.style_web == "style_1") {
                    return (<ProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_2") {
                    return (<VerticaleProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_3") {
                    return (<HorizontalProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_4") {
                    return (<ProductSwiperWithImage section={section} index={index} />)
                }
            })}
            {shop.shop?.is_brand_section_in_homepage ?
                <div className='category_section_brand'>
                    <div className="container">
                        <Brand />
                    </div>
                </div>
                : <></>}
            {belowBrandsSection?.map((section, index) => {
                if (section?.style_web == "style_1") {
                    return (<ProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_2") {
                    return (<VerticaleProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_3") {
                    return (<HorizontalProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_4") {
                    return (<ProductSwiperWithImage section={section} index={index} />)
                }
            })}
            {shop.shop?.is_seller_section_in_homepage ?
                <div className='category_section'>
                    <div className='container'>
                        <ShopBySellers />
                    </div>
                </div>
                : <></>}
            {belowShopSellerSection?.map((section) => {
                if (section?.style_web == "style_1") {
                    return (<ProductContainer section={section} />)
                } else if (section?.style_web == "style_2") {
                    return (<VerticaleProductContainer section={section} />)
                } else if (section?.style_web == "style_3") {
                    return (<HorizontalProductContainer section={section} />)
                } else if (section?.style_web == "style_4") {
                    return (<ProductSwiperWithImage section={section} />)
                }
            })}
            {shop.shop?.is_country_section_in_homepage ?
                <div className='category_section'>
                    <div className='container'>
                        <ShopByCountries />
                    </div>
                </div>
                : <></>}
            {belowCoutrySection?.map((section, index) => {
                if (section?.style_web == "style_1") {
                    return (<ProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_2") {
                    return (<VerticaleProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_3") {
                    return (<HorizontalProductContainer section={section} index={index} />)
                } else if (section?.style_web == "style_4") {
                    return (<ProductSwiperWithImage section={section} index={index} />)
                }
            })}
        </section>

    );
};

export default HomeContainer;
