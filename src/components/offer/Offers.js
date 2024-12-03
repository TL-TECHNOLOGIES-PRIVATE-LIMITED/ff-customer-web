import React from 'react';
import './offer.css';
import Slider from 'react-slick';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { setFilterCategory } from "../../model/reducer/productFilterReducer";
import { useNavigate } from 'react-router-dom';



const Offers = () => {

    const shop = useSelector(state => state.shop);
    const setting = useSelector(state => state.setting);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const CustomPrevButton = (props) => (
        <button {...props} type="button" className="slick-prev">
            <FaChevronLeft size={30} className="prev-arrow" />
        </button>
    );
    const CustomNextButton = (props) => (
        <button {...props} type="button" className="slick-next" >
            <FaChevronRight color='#f7f7f7' size={30} className='next-arrow' />
        </button>
    );
    const settings = {
        infinite: false,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: false,
        direction: 'rtl',
        pauseOnDotsHover: false,
        pauseOnFocus: true,
        slidesToShow: 2,
        slidesPerRow: 1,
        initialSlide: 0,
        prevArrow:
            // (
            //     <button type="button" className="slick-prev">
            //         <FaChevronLeft size={30} className="prev-arrow" />
            //     </button>
            // )
            <CustomPrevButton />
        ,
        nextArrow:
            // (
            //     <button type="button" className="slick-next" >
            //         <FaChevronRight color='#f7f7f7' size={30} className='next-arrow' />
            //     </button>
            // )
            <CustomNextButton />,
        // Add custom navigation buttons using Font Awesome icons
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                }
            },

            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            },
            {
                breakpoint: 425,
                settings: {
                    slidesToShow: 1,

                }
            }
        ]
    };
    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo;
    };
    return (
        <>
            {shop.shop.offers.length === 0
                ? null
                : (
                    <>
                        <div className="col-md-12">
                            <div className="offer-container">
                                <div className="row">
                                    <div className='col-12 d-flex flex-column offer-container-heading'>
                                        <div className="">
                                            <span>{t("offer_header")}</span>
                                            <p>{t("offer_title")}</p>
                                        </div>
                                    </div>
                                    <div className="offer-container-content">

                                        <Slider {...settings}>
                                            {shop.shop.offers.map((offer, index) => (
                                                <div key={`${offer?.category?.id}-${offer?.product?.slug}-${offer?.offer_url}`} onClick={() => {
                                                    if (offer?.category) {
                                                        dispatch(setFilterCategory({ data: offer?.category?.id.toString() }));
                                                        navigate("/products");
                                                    } else if (offer?.product) {
                                                        navigate(`/product/${offer.product.slug}`);
                                                    } else if (offer?.offer_url) {
                                                        window.open(offer?.offer_url, "_blank");
                                                    }
                                                }} className={`${offer?.category ? "cursorPointer" : ""} ${offer?.product ? "cursorPointer" : ""} ${offer?.offer_url ? "cursorPointer" : ""}`}>
                                                    <div className="offer-container-body p-2 col-3'">

                                                        <img onError={placeHolderImage} src={offer.image_url} alt="offers" />
                                                        {/* <button type='button'>shop now <AiOutlineArrowRight fill="#fff" /></button> */}
                                                    </div>
                                                </div>
                                            ))}

                                        </Slider>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </>
                )}
        </>
    );
};

export default Offers;
