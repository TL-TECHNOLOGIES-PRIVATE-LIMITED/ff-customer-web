import React, { useEffect, useState } from 'react'
import "./horizontalProductContainer.css"
import { useSelector } from 'react-redux';
import api from '../../api/api';
import HorizontalProductcard from "./HorizontalProductCard"
import { Link } from 'react-router-dom';
import { setFilterCategory, setFilterSection, setFilterSort } from '../../model/reducer/productFilterReducer';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const HorizontalProductContainer = ({ section }) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cssmode } = useSelector(state => state.cssmode)
    const shop = useSelector((state) => state.shop);
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
                <section className='horizontal-product-section' style={cssmode == "dark" ?
                    section?.background_color_for_dark_theme != "" ? { backgroundColor: section?.background_color_for_dark_theme } :
                        { backgroundColor: "var(--body-background-color)" }
                    :
                    section?.background_color_for_light_theme != "" ?
                        { backgroundColor: section?.background_color_for_light_theme } :
                        { backgroundColor: "var(--body-background-color)" }
                }>
                    <div className='container '>

                        <div>
                            <div className='product-container-header row d-flex'>
                                <div className='col-11'>
                                    <h2>{section.title?.length > 50 ? section.title?.substring(0, 50) + "..." : section.title}</h2>
                                    <p className=' d-md-block'>{section.short_description?.lenght > 70 ? section.short_description?.substring(0, 70) + "..." : section.short_description}</p>

                                </div>
                                <div className='d-flex col-1' >
                                    <span onClick={() => handleViewMore()} >View all</span>
                                </div>
                            </div>
                            <div className='horizontal-products row '>
                                {section?.products?.slice(0, 6)?.map((prdct) => {
                                    return (
                                        <div className='col-md-6 col-sm-6 col-lg-4 col-12 my-2'>
                                            <HorizontalProductcard product={prdct} />
                                        </div>
                                    )
                                })}
                            </div>

                        </div>


                    </div>
                </section>
                : null}
            {promotionImage?.map((offer) => (
                <div className='col-md-12  col-12  container promotion-img' key={offer?.id} onClick={() => {
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
    )
}

export default HorizontalProductContainer