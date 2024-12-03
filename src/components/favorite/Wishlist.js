import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import coverImg from '../../utils/cover-img.jpg';
import '../cart/cart.css';
import './favorite.css';
import EmptyCart from '../../utils/zero-state-screens/Empty_Cart.svg';
import { useNavigate, Link } from 'react-router-dom';
import { BsPlus } from "react-icons/bs";
import { BiMinus } from 'react-icons/bi';
import api from '../../api/api';
import { toast } from 'react-toastify';
import { RiDeleteBinLine } from 'react-icons/ri';
import Loader from '../loader/Loader';
import { IoIosArrowDown } from 'react-icons/io';
import QuickViewModal from '../product/QuickViewModal';
import { useTranslation } from 'react-i18next';
import { setProductSizes } from '../../model/reducer/productSizesReducer';
import { setFavourite, setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import { setCart, setCartProducts, setCartSubTotal, setSellerFlag } from '../../model/reducer/cartReducer';
import Popup from '../same-seller-popup/Popup';
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder.jsx";
import ProductVariantModal from '../product/ProductVariantModal.jsx';
import * as newApi from "../../api/apiCollection.js"

const Wishlist = () => {

    const closeCanvas = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const favorite = useSelector(state => (state.favourite));
    const city = useSelector(state => (state.city));
    const sizes = useSelector(state => (state.productSizes));
    const cart = useSelector((state) => state.cart);
    const setting = useSelector((state) => state.setting);
    const user = useSelector((state) => state.user);

    const [productSizes, setproductSizes] = useState(null);
    const [isfavoriteEmpty, setisfavoriteEmpty] = useState(false);
    const [isLoader, setisLoader] = useState(false);
    const [selectedProduct, setselectedProduct] = useState({});
    const [p_id, setP_id] = useState(0);
    const [p_v_id, setP_V_id] = useState(0);
    const [qnty, setQnty] = useState(0);
    const [isNetworkError, setIsNetworkError] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false)


    useEffect(() => {
        if (sizes.sizes === null || sizes.status === 'loading') {
            if (city.city !== null && favorite.favorite !== null) {
                api.getProductbyFilter(city.city.latitude, city.city.longitude)
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

        if (favorite.favorite === null && favorite.status === 'fulfill') {
            setisfavoriteEmpty(true);
        }
        else {
            setisfavoriteEmpty(false);
        }

    }, [favorite]);

    useEffect(() => {
        api.getFavorite(user?.jwtToken, city.city.latitude, city.city.longitude)
            .then(response => response.json())
            .then((result) => {
                dispatch(setFavourite({ data: result }));
            }).catch((err) => {
                const isNoInternet = ValidateNoInternet(err);
                if (isNoInternet) {
                    setIsNetworkError(isNoInternet);
                }
            });
    }, []);

    const handleVariantModal = (product) => {
        setselectedProduct(product)
        if (product?.variants?.length > 1) {
            setShowVariantModal(true)
        }
    }

    //Add to Cart

    const addtoCart = async (productId, productVId, qty) => {
        try {
            const response = await newApi.addToCart({ product_id: productId, product_variant_id: productVId, qty: qty })
            if (response.status === 1) {
                if (cart?.cartProducts?.find((product) => ((product?.product_id == productId) && (product?.product_variant_id == productVId)))?.qty == undefined) {
                    dispatch(setCart({ data: response }));
                    const updatedCartCount = [...cart?.cartProducts, { product_id: productId, product_variant_id: productVId, qty: qty }];
                    dispatch(setCartProducts({ data: updatedCartCount }));
                    dispatch(setCartSubTotal({ data: response?.sub_total }));
                }
                else {
                    const updatedProducts = cart?.cartProducts?.map(product => {
                        if (((product.product_id == productId) && (product?.product_variant_id == productVId))) {
                            return { ...product, qty: qty };
                        } else {
                            return product;
                        }
                    });
                    dispatch(setCart({ data: response }));
                    dispatch(setCartProducts({ data: updatedProducts }));
                    dispatch(setCartSubTotal({ data: response?.sub_total }));
                }
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    const removefromCart = async (productId, variantId) => {
        try {
            const response = await newApi.removeFromCart({ product_id: productId, product_variant_id: variantId })
            if (response?.status === 1) {
                const updatedProducts = cart?.cartProducts?.filter(product => ((product?.product_id != productId) && (product?.product_variant_id != variantId)));
                dispatch(setCartSubTotal({ data: response?.sub_total }));
                dispatch(setCartProducts({ data: updatedProducts }));
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    //remove from favorite
    const removefromFavorite = async (productId) => {
        setisLoader(true);
        const res = await newApi.removeFromFavorite({ product_id: productId })
        if (res.status === 1) {
            const updatedFavoriteList = favorite.favorite.data.filter(item => item.id !== productId);
            dispatch(setFavourite({ data: { ...favorite.favorite, data: updatedFavoriteList } }));
            const updatedFavouriteProducts = favorite?.favouriteProductIds.filter(id => id != productId);
            dispatch(setFavouriteProductIds({ data: updatedFavouriteProducts }));
            const updatedFavouriteLength = favorite?.favouritelength - 1;
            dispatch(setFavouriteLength({ data: updatedFavouriteLength }));
            setisLoader(false);
        } else {
            setisLoader(false);
            toast.error(res.message);
        }
    }
    // const removefromFavorite = async (product_id) => {
    //     setisLoader(true);
    //     await api.removeFromFavorite(user?.jwtToken, product_id)
    //         .then(response => response.json())
    //         .then(async (result) => {
    //             if (result.status === 1) {

    //                 const updatedFavoriteList = favorite.favorite.data.filter(item => item.id !== product_id);
    //                 dispatch(setFavourite({ data: { ...favorite.favorite, data: updatedFavoriteList } }));
    //                 const updatedFavouriteProducts = favorite?.favouriteProductIds.filter(id => id != product_id);
    //                 dispatch(setFavouriteProductIds({ data: updatedFavouriteProducts }));
    //                 const updatedFavouriteLength = favorite?.favouritelength - 1;
    //                 dispatch(setFavouriteLength({ data: updatedFavouriteLength }));
    //                 setisLoader(false);
    //             }
    //             else {
    //                 setisLoader(false);
    //                 toast.error(result.message);
    //             }
    //         });

    // };
    const { t } = useTranslation();
    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo;
    };
    return (
        <>
            {!isNetworkError ?
                <section id='wishlist' className='wishlist'>
                    <div className='cover'>
                        <img src={coverImg} className='img-fluid' alt="cover"></img>
                        <div className='title'>
                            <h3>{t("wishList")}</h3>
                            <span><Link to='/' className='text-light text-decoration-none'>{t("home")} / </Link></span><span className='active'>{t("wishList")}</span>
                        </div>
                    </div>

                    <div className='view-cart-container container'>
                        {favorite.favorite && favorite.favorite.status === 0 ? (
                            <div className='empty-cart'>
                                <img src={EmptyCart} className='no-data-img' alt='empty-cart'></img>
                                <p>{t("enter_wishlist_message")}</p>
                                <span>{t("enter_wishlist_description")}</span>
                                <button type='button' onClick={() => {
                                    navigate('/products');
                                }}>{t("empty_cart_list_button_name")}</button>
                            </div>
                        ) : (
                            <>
                                {favorite.favorite === null || productSizes === null
                                    ? (
                                        <Loader screen='full' />
                                    )
                                    : (
                                        <>
                                            {isLoader ? <Loader screen='full' background='none' /> : null}
                                            <div className='viewcart-product-wrapper'>
                                                <div className='product-heading'>
                                                    <h3>{t("your_wishlist")}</h3>
                                                    <span>{t("there_are")} </span><span className='title'>{favorite.favorite.total}</span> <span> {t("product_in_your_saved")}</span>
                                                </div>

                                                <table className='products-table table'>
                                                    <thead>
                                                        <tr>
                                                            <th className='first-column'>{t("products")}</th>
                                                            <th>{t("price")}</th>
                                                            <th>{t("add_to_cart")}</th>
                                                            <th className='last-column'>{t("remove")}</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {favorite.favorite.status !== 0 && favorite?.favorite?.data?.map((product, index) => (
                                                            <tr key={index} className=''>
                                                                <th className='products-image-container first-column'>
                                                                    <div className='image-container'>

                                                                        <ImageWithPlaceholder src={product.image_url} alt='productImage' />

                                                                    </div>
                                                                    <div className=''>
                                                                        <span>{product.name}</span>
                                                                        <div className='variant-section' onClick={() => {

                                                                            handleVariantModal(product);
                                                                        }} >{product.variants[0]?.measurement} {product.variants[0]?.stock_unit_name}
                                                                            {product.variants?.length > 1 ? <IoIosArrowDown /> : null}

                                                                        </div>
                                                                    </div>
                                                                </th>

                                                                <th className='price'>
                                                                    {setting.setting && setting.setting.currency + ' '}
                                                                    <span id={`price-wishlist${index}`}>{(product.variants.length > 0 ?
                                                                        product.variants[0]?.discounted_price != "0" ?
                                                                            product.variants[0]?.discounted_price.toFixed(setting.setting && setting.setting.decimal_point) :
                                                                            product.variants[0].price.toFixed(setting.setting && setting.setting.decimal_point) : 0)}</span>
                                                                </th>
                                                                <th className='quantity'>
                                                                    {product?.variants?.length <= 1 && product?.variants?.[0]?.is_unlimited_stock == 0 && product?.variants?.[0]?.stock == 0 ?

                                                                        <span className="out_of_stockText .text-danger">{t("out_of_stock")}</span>

                                                                        :

                                                                        cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty > 0 ?
                                                                            <>
                                                                                <div className='counter' id={`input-cart-wishlist${index}`}>
                                                                                    <button type='button' onClick={() => {
                                                                                        if (cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty > 1) {
                                                                                            addtoCart(product.id, product.variants[0]?.id, cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty - 1);
                                                                                        } else {
                                                                                            removefromCart(product.id, product.variants[0]?.id);

                                                                                        }
                                                                                    }}><BiMinus fill='#fff' /></button>

                                                                                    <span id={`input-cart-sidebar${index}`} >{cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty}</span>

                                                                                    <button type='button' onClick={() => {

                                                                                        if (Number(product.is_unlimited_stock)) {

                                                                                            if (cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty < Number(setting.setting.max_cart_items_count)) {
                                                                                                addtoCart(product.id, product.variants[0]?.id, cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty + 1);


                                                                                            } else {
                                                                                                toast.error('Apologies, maximum product quantity limit reached!');
                                                                                            }
                                                                                        } else {

                                                                                            if (cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty >= Number(product.variants[0]?.stock)) {
                                                                                                toast.error(t("out_of_stock_message"));
                                                                                            }
                                                                                            else if (Number(cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty) >= Number(product.total_allowed_quantity)) {
                                                                                                toast.error('Apologies, maximum product quantity limit reached');
                                                                                            } else {

                                                                                                addtoCart(product.id, product.variants[0]?.id, cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.variants?.[0]?.id)?.qty + 1);
                                                                                            }
                                                                                        }

                                                                                    }}><BsPlus fill='#fff' /></button>
                                                                                </div>
                                                                            </>

                                                                            :
                                                                            <>
                                                                                <button type='button' id={`Add-to-cart-wishlist${index}`} className='add-to-cart active'
                                                                                    onClick={() => {
                                                                                        if (user?.jwtToken !== "") {
                                                                                            addtoCart(product.id, product.variants[0]?.id, 1);
                                                                                            setP_id(product.id);
                                                                                            setP_V_id(product.variants[0]?.id);
                                                                                            setQnty(1);
                                                                                        }
                                                                                        else {
                                                                                            toast.error(t("required_login_message_for_cartRedirect"));
                                                                                        }

                                                                                    }}
                                                                                    disabled={!Number(product.is_unlimited_stock) && product.variants[0].status === 0}
                                                                                >{t("add_to_cart")}</button></>}
                                                                </th>
                                                                <th className='remove last-column'>
                                                                    <button type='button' onClick={() => removefromFavorite(product.id)}>
                                                                        <RiDeleteBinLine fill='red' fontSize={'2.985rem'} />
                                                                    </button>
                                                                </th>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}
                            </>
                        )}
                    </div>
                    <QuickViewModal selectedProduct={selectedProduct} setselectedProduct={setselectedProduct} />
                    <Popup
                        product_id={p_id}
                        product_variant_id={p_v_id}
                        quantity={qnty}
                        setisLoader={setisLoader}
                        toast={toast}
                        city={city}
                        setP_V_id={setP_V_id}
                        setP_id={setP_id} />
                    <ProductVariantModal showVariantModal={showVariantModal} setShowVariantModal={setShowVariantModal} product={selectedProduct} />
                </section>
                :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>
            }
        </>

    );
};

export default Wishlist;
