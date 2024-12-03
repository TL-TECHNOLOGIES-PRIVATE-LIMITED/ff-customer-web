import React, { useEffect, useState } from 'react';
import './product.css';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsHeart, BsPlus, BsHeartFill } from "react-icons/bs";
import { BiMinus, BiLink } from 'react-icons/bi';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
import Loader from '../loader/Loader';
import Slider from 'react-slick';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import { setProductSizes } from '../../model/reducer/productSizesReducer';
import { addtoGuestCart, setCart, setCartProducts, setCartSubTotal, setSellerFlag } from '../../model/reducer/cartReducer';
import { setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { Navigation, Thumbs, Mousewheel, Autoplay, Pagination } from "swiper/modules";
import 'swiper/css/pagination';

const QuickViewModal = (props) => {

    const dispatch = useDispatch();

    const setting = useSelector(state => state.setting);
    const city = useSelector(state => state.city);
    const sizes = useSelector(state => state.productSizes);
    const cart = useSelector(state => state.cart);
    const favorite = useSelector(state => state.favourite);
    const user = useSelector(state => state.user);



    const [mainimage, setmainimage] = useState("");
    const [productcategory, setproductcategory] = useState({});
    // const [productbrand, setproductbrand] = useState({});
    const [product, setproduct] = useState({});
    const [productSizes, setproductSizes] = useState(null);
    const [isLoader, setisLoader] = useState(false);
    const [variant_index, setVariantIndex] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [images, setimages] = useState([]);

    useEffect(() => {
        if (Object.keys(props.selectedProduct).length > 0 && city.city !== null && Object.keys(product).length === 0 && props.showModal === true) {

            fetchProduct(props.selectedProduct.id);
        }
        else if (props.showModal === true) {
            fetchProductVariant(props.selectedProduct.id);
        }
    }, [props.showModal]);



    const fetchProduct = async (product_id) => {
        // console.log("fetchProduct Called");
        await api.getProductbyId(city.city.latitude, city.city.longitude, product_id, user?.jwtToken)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    // console.log("fetchProduct Result ->", result.data);
                    setproduct(result.data);
                    setVariantIndex(result.data.variants?.length > 0 && result.data.variants[0]?.id);
                    setmainimage(result.data.image_url);
                    setimages([result.data.image_url, ...result.data.images]);
                    setSelectedVariant((result.data.variants?.length > 0 && result.data.variants.find((element) => element.id == variant_index)) || result.data.variants?.[0]);
                }
            })
            .catch(error => console.log(error));
    };

    const fetchProductVariant = async (product_id) => {
        await api.getProductbyId(city.city.latitude, city.city.longitude, product_id, user?.jwtToken)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setproduct(result.data);
                    setVariantIndex(result.data.variants?.length > 0 && result.data.variants[0]?.id);
                    setmainimage(result.data.image_url);
                    setSelectedVariant((result.data.variants?.length > 0 && result.data.variants.find((element) => element.id == variant_index)) || result.data.variants?.[0]);
                }
            })
            .catch(error => console.log(error));
    };



    useEffect(() => {
        if (sizes.sizes === null || sizes.status === 'loading') {
            if (city.city !== null) {
                api.getProductbyFilter(city.city.latitude, city.city.longitude, user?.jwtToken)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            setproductSizes(result.sizes);
                            dispatch(setProductSizes({ data: result.sizes }));
                        }
                    });
            }
        }
        else {
            setproductSizes(sizes.sizes);
        }
    }, [city, sizes]);




    //Add to Cart
    const addtoCart = async (product_id, product_variant_id, qty) => {
        // console.log("QuickView Add to Cart -> ", product_id, product_variant_id, qty);
        setisLoader(true);
        await api.addToCart(user?.jwtToken, product_id, product_variant_id, qty)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    if (cart?.cartProducts?.find((product) => (product?.product_id == product_id) && (product?.product_variant_id == product_variant_id))?.qty == undefined) {
                        dispatch(setCart({ data: result }));
                        dispatch(setCartSubTotal({ data: result?.data?.sub_total }));
                        const updatedCartCount = [...cart?.cartProducts, { product_id: product_id, product_variant_id: product_variant_id, qty: qty }];
                        dispatch(setCartProducts({ data: updatedCartCount }));
                    } else {
                        const updatedProducts = cart?.cartProducts?.map(product => {
                            if ((product.product_id == product_id) && (product?.product_variant_id == product_variant_id)) {
                                return { ...product, qty: qty };
                            } else {
                                return product;
                            }
                        });
                        dispatch(setCart({ data: result }));
                        dispatch(setCartProducts({ data: updatedProducts }));
                        dispatch(setCartSubTotal({ data: result?.data?.sub_total }));
                    }
                }
                else if (result?.data?.one_seller_error_code == 1) {
                    dispatch(setSellerFlag({ data: 1 }));
                    // console.log(result.message);
                    // toast.error(t(`${result.message}`));
                    props.setShowModal(false);
                } else {
                    toast.error(result.message);
                }
                setisLoader(false);
            });
    };

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        await api.removeFromCart(user?.jwtToken, product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    dispatch(setCartSubTotal({ data: result?.sub_total }));
                    const updatedCartProducts = cart?.cartProducts?.filter(product => {
                        if (product?.product_variant_id != product_variant_id) {
                            return product;
                        }
                    });
                    dispatch(setCartProducts({ data: updatedCartProducts ? updatedCartProducts : [] }));
                }
                else {
                    toast.error(result.message);
                }
            });
    };

    //Add to favorite
    const addToFavorite = async (product_id) => {
        await api.addToFavotite(user?.jwtToken, product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    const updatedFavouriteProducts = [...favorite.favouriteProductIds, product_id];
                    dispatch(setFavouriteProductIds({ data: updatedFavouriteProducts }));
                    const updatedFavouriteLength = favorite?.favouritelength + 1;
                    dispatch(setFavouriteLength({ data: updatedFavouriteLength }));
                }
                else {
                    // setisLoader(false);
                    toast.error(result.message);
                }
            });
    };

    const removefromFavorite = async (product_id) => {
        await api.removeFromFavorite(user?.jwtToken, product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    const updatedFavouriteProducts = favorite?.favouriteProductIds.filter(id => id != product_id);
                    dispatch(setFavouriteProductIds({ data: updatedFavouriteProducts }));
                    const updatedFavouriteLength = favorite?.favouritelength - 1;
                    dispatch(setFavouriteLength({ data: updatedFavouriteLength }));
                }
                else {
                    toast.error(result.message);
                }
            });
    };

    const CustomPrevButton = (props) => {
        const { slideCount, currentSlide, ...remainingProps } = props;
        return (
            <button {...remainingProps} type="button" className="slick-prev">
                <FaChevronLeft fill='black' size={30} className="product-details-prev-arrow" />
            </button>
        );
    };
    const CustomNextButton = (props) => {
        const { slideCount, currentSlide, ...remainingProps } = props;
        return (
            <button {...remainingProps} type="button" className="slick-next">
                <FaChevronRight fill='black' size={30} className='product-details-next-arrow' />
            </button>
        );
    };

    const handleVariantChange = (variant, index) => {
        props.setP_id(product.id);
        props.setP_V_id(variant.id);
        setSelectedVariant(variant);
        setVariantIndex(index);
    };

    const { t } = useTranslation();

    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo;
    };

    function getProductQuantities(products) {
        return Object.entries(products.reduce((quantities, product) => {
            const existingQty = quantities[product.product_id] || 0;
            return { ...quantities, [product.product_id]: existingQty + product.qty };
        }, {})).map(([productId, qty]) => ({
            product_id: parseInt(productId),
            qty
        }));
    }


    const handleValidateAddExistingProduct = (productQuantity, product) => {
        if (Number(product.is_unlimited_stock)) {
            if (productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty >= Number(product?.total_allowed_quantity)) {
                toast.error(t("max_cart_limit_error"));
            }
            else {
                addtoCart(product.id, selectedVariant.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty + 1);
            }
        }
        else {
            if (selectedVariant.cart_count >= Number(selectedVariant.stock)) {
                toast.error(t("limited_product_stock_error"));
            }
            else if (productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty >= Number(product?.total_allowed_quantity)) {
                toast.error(t("max_cart_limit_error"));
            }
            else {
                addtoCart(product.id, selectedVariant.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty + 1);
            }
        }
    };

    const handleValidateAddNewProduct = (productQuantity, product) => {
        if (user?.jwtToken !== "") {
            if (productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty >= Number(product?.total_allowed_quantity)) {
                toast.error(t("limited_product_stock_error"));
            }
            else if (Number(product.is_unlimited_stock)) {
                addtoCart(product.id, selectedVariant.id, 1);
            } else {
                if (selectedVariant.status) {
                    addtoCart(product.id, selectedVariant.id, 1);
                } else {
                    toast.error(t("limited_product_stock_error"));
                }
            }
        }
        else {
            toast.error(t("required_login_message_for_cartRedirect"));
        }
    };

    const handleValidateAddExistingGuestProduct = (productQuantity, product, quantity) => {
        if (Number(product.is_unlimited_stock)) {
            if (productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty >= Number(product?.total_allowed_quantity)) {
                toast.error(t("max_cart_limit_error"));
            }
            else {
                AddToGuestCart(product?.id, selectedVariant.id, quantity, 1);
            }
        }
        else {
            if (selectedVariant.cart_count >= Number(selectedVariant.stock)) {
                toast.error(t("limited_product_stock_error"));
            }
            else if (productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty >= Number(product?.total_allowed_quantity)) {
                toast.error(t("max_cart_limit_error"));
            }
            else {
                AddToGuestCart(product?.id, selectedVariant.id, quantity, 1);
            }
        }
    };

    const AddToGuestCart = (productId, productVariantId, Qty, isExisting) => {
        if (isExisting) {
            const updatedProducts = cart?.guestCart?.map((product) => {
                if (product?.product_id == productId && product?.product_variant_id == productVariantId) {
                    return { ...product, qty: Qty };
                } else {
                    return product;
                }
            }).filter(product => product?.qty !== 0);
            dispatch(addtoGuestCart({ data: updatedProducts }));
        } else {
            const productData = { product_id: productId, product_variant_id: productVariantId, qty: Qty };
            dispatch(addtoGuestCart({ data: [...cart?.guestCart, productData] }));
        }
    };

    return (
        <Modal
            size='lg'
            centered
            show={props.showModal}
            onHide={() => props.setShowModal(false)}
            backdrop={"static"}>
            <div className="product-details-view">
                <Modal.Body className='modal-body'>
                    <div className="d-flex flex-row justify-content-end header">
                        <button type="button" aria-label="Close" onClick={() => {
                            // props.setselectedProduct({});
                            // setproductcategory({});
                            // setproductbrand({});
                            setproduct({});
                            setSelectedVariant(null);
                            setQuantity(0);
                            setVariantIndex(0);
                            props.setShowModal(false);
                        }} className="closeBtn"><AiOutlineCloseCircle size={30} /></button>
                    </div>

                    {

                        Object.keys(product).length === 0 || productSizes === null

                            ? (
                                <>

                                    < Loader />
                                </>

                            )
                            : (
                                <div className="top-wrapper">

                                    <div className='row body-wrapper'>
                                        <div className="col-xl-4 col-lg-6 col-md-12 col-12">
                                            <div className='image-wrapper'>
                                                <div className='main-image border'>
                                                    <img onError={placeHolderImage} src={mainimage} alt='main-product' className='col-12' />
                                                </div>


                                                <div className='sub-images-container row'>
                                                    {images?.length >= 1 ?
                                                        <Swiper style={{
                                                            '--swiper-navigation-color': '#fff',
                                                            '--swiper-pagination-color': '#fff',
                                                        }}
                                                            breakpoints={{
                                                                0: {
                                                                    slidesPerView: 3,
                                                                    spaceBetween: 6
                                                                },
                                                                500: {
                                                                    slidesPerView: 5,
                                                                    spaceBetween: 2
                                                                },
                                                                992: {
                                                                    slidesPerView: 3,
                                                                    spaceBetween: 5
                                                                }
                                                            }}

                                                            navigation={true}
                                                            thumbs={{ swiper: thumbsSwiper }}
                                                            modules={[Navigation, Thumbs, Mousewheel, Autoplay, Pagination]}
                                                            className="mySwiper2">

                                                            {images?.map((image, index) => {
                                                                return (
                                                                    <SwiperSlide className='swiper-slide'>
                                                                        <div key={index} className={`sub-image ${mainimage == image ? 'active' : ''}`}>
                                                                            <img onError={placeHolderImage} src={image} className='col-12' alt="product" onClick={() => {
                                                                                setmainimage(image);
                                                                            }} />
                                                                        </div>
                                                                    </SwiperSlide>
                                                                )

                                                            })}

                                                        </Swiper>
                                                        :
                                                        <>
                                                            {product.images.map((image, index) => (
                                                                <div key={index} className={`sub-image border ${mainimage === image ? 'active' : ''}`}>
                                                                    <img onError={placeHolderImage} src={image} className='col-12 ' alt="product" onClick={() => {
                                                                        setmainimage(image);
                                                                    }}></img>
                                                                </div>
                                                            ))}
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-8 col-lg-6 col-md-12 col-12">

                                            <div className='detail-wrapper'>
                                                <div className='top-section'>
                                                    <p className='product_name'>{product.name}</p>
                                                    <div className="d-flex flex-row gap-2 align-items-center my-1">

                                                        <div id="price-section-quickview" className='d-flex flex-row gap-2 align-items-center my-1'>
                                                            {setting.setting && setting.setting.currency}
                                                            <p id='priceContainer' className='m-0'>
                                                                {selectedVariant ? (selectedVariant.discounted_price === 0 ? selectedVariant.price?.toFixed(setting.setting && setting.setting.decimal_point) : selectedVariant.discounted_price?.toFixed(setting.setting && setting.setting.decimal_point)) : (product.variants[0].discounted_price === 0 ? product.variants[0].price?.toFixed(setting.setting && setting.setting.decimal_point) : product.variants[0].discounted_price?.toFixed(setting.setting && setting.setting.decimal_point))}
                                                            </p>
                                                            {(selectedVariant?.price && (selectedVariant?.discounted_price !== 0)) && (selectedVariant?.price !== selectedVariant?.discounted_price) ?
                                                                <p className='fw-normal text-decoration-line-through' style={{ color: "var(--sub-text-color)", fontSize: "16px", marginTop: "5px" }}>
                                                                    {setting.setting && setting.setting.currency}
                                                                    {selectedVariant?.price?.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                </p>
                                                                : null}
                                                        </div>
                                                    </div>




                                                </div>
                                                <div className='bottom-section'>
                                                    {/* <p>{t("product_variants")}</p> */}


                                                    <div className='d-flex gap-3 bottom-section-content '>
                                                        <input type="hidden" id="productdetail-selected-variant-id" name="variant" value={selectedVariant ? selectedVariant.id : product.variants[0].id} />
                                                        <div className="variants">
                                                            <div className="row">
                                                                {/* <input type="hidden" name="" value={product.variants[0].id} id='quickview-selected-variant-id' /> */}
                                                                {product.variants.map((variant, index) => {
                                                                    return (
                                                                        <div className="variant-section col-2" key={variant?.id}>
                                                                            <div className={`variant-element ${variant_index === variant.id ? 'active' : ''} ${Number(product.is_unlimited_stock) ? "" : (!variant.status ? "out_of_stock" : "")}`} key={index}>
                                                                                <label className="element_container " htmlFor={`variants${index}`}>
                                                                                    <div className="top-section">

                                                                                        <input type="radio" name={`variants${index}`} id={`variants${index}`} checked={variant_index === variant.id} disabled={Number(product.is_unlimited_stock) ? false : (variant.cart_count >= variant.stock ? true : false)} onChange={() => handleVariantChange(variant, variant.id)
                                                                                        }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="bottom-section">
                                                                                        <span className="d-flex align-items-center flex-column">{variant.measurement} {variant.stock_unit_name} </span>
                                                                                    </div>
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>




                                                    </div>
                                                    {selectedVariant ?
                                                        (cart?.isGuest === false && user?.user && cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty >= 1) ||
                                                            (cart?.isGuest === true && cart?.guestCart?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty > 0)
                                                            ? <>
                                                                <div id={`input-cart-quickview`} className="input-to-cart">
                                                                    {/* Remove From Cart Button */}
                                                                    <button type='button' onClick={(e) => {
                                                                        e.preventDefault();
                                                                        if (cart?.isGuest) {
                                                                            AddToGuestCart(product?.id, selectedVariant.id, cart?.guestCart?.find(prdct => prdct?.product_id == product?.id && prdct?.product_variant_id == selectedVariant?.id)?.qty - 1, 1);
                                                                        } else {
                                                                            if (cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty == 1) {
                                                                                removefromCart(product.id, selectedVariant.id);
                                                                            }
                                                                            else {
                                                                                addtoCart(product.id, selectedVariant.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty - 1);
                                                                            }
                                                                        }
                                                                    }} className="wishlist-button">
                                                                        <BiMinus fill='#fff' />
                                                                    </button>
                                                                    <span id={`input-quickview`} >{cart?.isGuest === false ?
                                                                        cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty :
                                                                        cart?.guestCart?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty
                                                                    }</span>
                                                                    <button type='button' onClick={(e) => {
                                                                        e.preventDefault();
                                                                        if (cart?.isGuest) {
                                                                            const productQuantity = getProductQuantities(cart?.guestCart);
                                                                            handleValidateAddExistingGuestProduct(productQuantity, product, cart?.guestCart?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty + 1);
                                                                        } else {
                                                                            const productQuantity = getProductQuantities(cart?.cartProducts);
                                                                            handleValidateAddExistingProduct(productQuantity, product);
                                                                        }
                                                                    }} className="wishlist-button"><BsPlus fill='#fff' /> </button>


                                                                </div>
                                                            </> :
                                                            <>
                                                                <button type='button' id={`Add-to-cart-quickview`} className='add-to-cart'
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        if (cart?.isGuest) {
                                                                            const productQuantity = getProductQuantities(cart?.guestCart);
                                                                            if (productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty >= Number(product?.total_allowed_quantity)) {
                                                                                toast.error(t('max_cart_limit_error'));
                                                                            }
                                                                            else if (Number(product.is_unlimited_stock)) {
                                                                                AddToGuestCart(product?.id, selectedVariant.id, 1, 0);
                                                                            } else {
                                                                                if (selectedVariant.status) {
                                                                                    AddToGuestCart(product?.id, selectedVariant.id, 1, 0);
                                                                                } else {
                                                                                    toast.error(t("limited_product_stock_error"));
                                                                                }
                                                                            }
                                                                        } else {
                                                                            const productQuantity = getProductQuantities(cart?.cartProducts);
                                                                            handleValidateAddNewProduct(productQuantity, product);
                                                                        }
                                                                    }}>{t("add_to_cart")}</button>
                                                            </>
                                                        : null}
                                                    {favorite.favorite && favorite.favouriteProductIds?.some(id => id == product.id) ? (
                                                        <button type="button" className='wishlist-product' onClick={() => {
                                                            if (user?.jwtToken !== "") {
                                                                removefromFavorite(product.id);
                                                            } else {
                                                                toast.error(t('required_login_message_for_wishlist'));
                                                            }
                                                        }}
                                                        >
                                                            <BsHeartFill size={16} fill='green' />
                                                        </button>
                                                    ) : (
                                                        <button key={product.id} type="button" className='wishlist-product' onClick={() => {
                                                            if (user?.jwtToken !== "") {
                                                                addToFavorite(product.id);
                                                            } else {
                                                                toast.error(t("required_login_message_for_wishlist"));
                                                            }
                                                        }}>
                                                            <BsHeart size={16} /></button>
                                                    )}

                                                    {product?.fssai_lic_no &&
                                                        <div className='fssai-details'>
                                                            <div className='image-container'>
                                                                <img src={product?.fssai_lic_img} alt='fssai' />
                                                            </div>
                                                            <div className='fssai-license-no'>
                                                                <span>
                                                                    {`${t('license_no')} : ${product.fssai_lic_no}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    }

                                                    {product?.brand_name ? (
                                                        <div className='product-overview'>
                                                            <div className='product-tags'>
                                                                <span className='tag-title'>{t("brand")} :</span>
                                                                <span className='tag-name'>{product?.brand_name} </span>
                                                            </div>
                                                        </div>
                                                    ) : ""}

                                                    <div className='share-product-container'>
                                                        <span>{t("share_product")} :</span>

                                                        <ul className='share-product'>
                                                            <li className='share-product-icon'><WhatsappShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><WhatsappIcon size={32} round={true} /></WhatsappShareButton></li>
                                                            <li className='share-product-icon'><TelegramShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><TelegramIcon size={32} round={true} /></TelegramShareButton></li>
                                                            <li className='share-product-icon'><FacebookShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><FacebookIcon size={32} round={true} /></FacebookShareButton></li>
                                                            <li className='share-product-icon'>
                                                                <button type='button' onClick={() => {
                                                                    navigator.clipboard.writeText(`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`);
                                                                    toast.success("Copied Succesfully!!");
                                                                }}> <BiLink size={30} /></button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                    }
                </Modal.Body>
            </div>
        </Modal>
    );

};

export default QuickViewModal;
