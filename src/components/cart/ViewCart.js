import React, { useEffect, useState } from 'react';
import './cart.css';
import { useSelector, useDispatch } from 'react-redux';
import { BsPlus } from "react-icons/bs";
import { BiMinus } from 'react-icons/bi';
import api from '../../api/api';
import { toast } from 'react-toastify';
import EmptyCart from '../../utils/zero-state-screens/Empty_Cart.svg';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import coverImg from '../../utils/cover-img.jpg';
import { RiCoupon2Fill, RiDeleteBinLine } from 'react-icons/ri';
import Loader from '../loader/Loader';
import Promo from './Promo';
import { useTranslation } from 'react-i18next';
import { addtoGuestCart, clearCartPromo, setCart, setCartProducts, setCartSubTotal } from '../../model/reducer/cartReducer';
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';


const ViewCart = () => {


    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cart = useSelector(state => (state.cart));
    const city = useSelector(state => (state.city));
    const user = useSelector(state => (state.user));
    const location = useLocation();
    const sizes = useSelector(state => (state.productSizes));
    const setting = useSelector(state => (state.setting));
    const cartItems = cart?.cart?.data;
    const [productSizes, setproductSizes] = useState(null);
    const [iscartEmpty, setiscartEmpty] = useState(false);
    const [isLoader, setisLoader] = useState(false);
    const [showPromoOffcanvas, setShowPromoOffcanvas] = useState(false);
    const [cartProducts, setViewCartProducts] = useState([]);
    const [isNetworkError, setIsNetworkError] = useState(false);
    const [guestCartSubTotal, setGuestCartSubTotal] = useState(null);

    useEffect(() => {
        if (location.pathname == "/cart" && cart?.isGuest === false) {
            api.getCart(user?.jwtToken, city.city.latitude, city.city.longitude, 0)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        // dispatch(setCartCheckout({ data: result.data }));
                        dispatch(setCart({ data: result }));
                        setViewCartProducts(result?.data?.cart);
                        const productsData = result?.data?.cart?.map((product) => {
                            return {
                                product_id: product?.product_id,
                                product_variant_id: product?.product_variant_id,
                                qty: product?.qty
                            };
                        });
                        dispatch(setCart({ data: result }));
                        dispatch(setCartSubTotal({ data: result?.data?.sub_total }));
                        dispatch(setCartProducts({ data: productsData }));
                    }

                })
                .catch(error => {
                    console.log(error);
                    const isNoInternet = ValidateNoInternet(error);
                    if (isNoInternet) {
                        setIsNetworkError(isNoInternet);
                    }
                });
        } else if (location.pathname == "/cart" && cart?.isGuest === true && cart?.guestCart?.length !== 0) {
            fetchGuestCart();
        } else if (location.pathname == "/cart" && cart?.isGuest === true && cart?.guestCart?.length === 0) {
            setiscartEmpty(true);
        }

    }, [user]);

    useEffect(() => {
        if (location.pathname == "/cart" && cart?.isGuest === true) {
            fetchGuestCart();
        }
    }, []);

    const fetchGuestCart = async () => {
        setisLoader(true);
        try {
            const variantIds = cart?.guestCart?.map((p) => p.product_variant_id);
            const quantities = cart?.guestCart?.map((p) => p.qty);
            const response = await api.getGuestCart(city?.city?.latitude, city?.city?.longitude, variantIds?.join(","), quantities?.join(","));
            const result = await response.json();
            if (result.status == 1) {
                setViewCartProducts(result.data.cart);
                setGuestCartSubTotal(result.data.sub_total);
                result?.data?.cart?.length > 0 ? setiscartEmpty(false) : setiscartEmpty(true);
            }
        } catch (e) {
            console.log(e?.message);
        }
        setisLoader(false);
    };

    useEffect(() => {
        if (cart?.cartProducts?.length == 0 && cart?.isGuest === false) {
            setiscartEmpty(true);
        }
    }, [cart?.cartProducts]);

    //Add to Cart
    const addtoCart = async (product_id, product_variant_id, qty) => {
        // setisLoader(true);
        await api.addToCart(user?.jwtToken, product_id, product_variant_id, qty)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    dispatch(clearCartPromo());
                    dispatch(setCartSubTotal({ data: result?.sub_total ? result?.sub_total : 0 }));
                    const updatedCartProducts = cartProducts?.map(product => {
                        if ((product.product_id == product_id) && (product?.product_variant_id == product_variant_id)) {
                            return { ...product, qty: qty };
                        } else {
                            return product;
                        }
                    });
                    setViewCartProducts(updatedCartProducts);
                    const updatedProducts = cart?.cartProducts?.map((product) => {
                        if ((product?.product_id == product_id) && (product?.product_variant_id == product_variant_id)) {
                            return { ...product, qty: qty };
                        } else {
                            return product;
                        }
                    });
                    dispatch(setCartProducts({ data: updatedProducts }));
                }
                else {
                    // setisLoader(false);
                    toast.error(result.message);
                }
            });
        // setisLoader(false);

    };

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        // setisLoader(true);
        await api.removeFromCart(user?.jwtToken, product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    dispatch(clearCartPromo());
                    const updatedCartProducts = cart?.cartProducts?.filter(product => {
                        if (product?.product_variant_id != product_variant_id) {
                            return product;
                        }
                    });
                    dispatch(setCartProducts({ data: updatedCartProducts ? updatedCartProducts : [] }));
                    dispatch(setCartSubTotal({ data: result?.sub_total }));
                    const updatedProducts = cartProducts?.filter(product => {
                        if (product.product_variant_id != product_variant_id) {
                            return product;
                        }
                    });
                    setViewCartProducts(updatedProducts);
                }
                else {
                    // setisLoader(false);
                    toast.error(result.message);
                }
            })
            .catch(error => console.log(error));
    };
    const { t } = useTranslation();
    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo;
    };

    const stockValidation = () => {
        cart.cart?.data?.cart.forEach(element => {
            if (!element.status) {
                return () => {
                    toast.error(t('some_items_are_out_of_stock'));
                };
            }
            navigate('/checkout');
        });
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

    const AddToGuestCart = (productId, productVariantId, Qty, isExisting) => {
        if (isExisting) {
            const updatedProducts = cart?.guestCart?.map((product) => {
                if (product?.product_id == productId && product?.product_variant_id == productVariantId) {
                    return { ...product, qty: Qty };
                } else {
                    return product;
                }
            }).filter(product => product?.qty !== 0);
            const updatedCartProducts = cartProducts?.map(product => {
                if ((product.product_id == productId) && (product?.product_variant_id == productVariantId)) {
                    return { ...product, qty: Qty };
                } else {
                    return product;
                }
            });
            computeSubTotal(updatedCartProducts);
            setViewCartProducts(updatedCartProducts);
            dispatch(addtoGuestCart({ data: updatedProducts }));
        } else {
            const productData = { product_id: productId, product_variant_id: productVariantId, qty: Qty };
            dispatch(addtoGuestCart({ data: [...cart?.guestCart, productData] }));
        }
    };
    const computeSubTotal = (products) => {
        const subTotal = products.reduce((prev, curr) => {
            console.log(prev, curr);
            prev += (curr.discounted_price !== 0 ? curr.discounted_price * curr.qty : curr.price * curr.qty);
            return prev;
        }, 0);
        console.log(subTotal);
        setGuestCartSubTotal(subTotal);
    };
    const RemoveFromGuestCart = (productVariantId) => {
        const updatedProducts = cart?.guestCart?.filter((p) => p.product_variant_id != productVariantId);
        const updatedSideBarProducts = cartProducts.filter((p) => p.product_variant_id != productVariantId);
        computeSubTotal(updatedSideBarProducts);
        setViewCartProducts(updatedSideBarProducts);
        if (updatedProducts?.length === 0) {
            setiscartEmpty(true);
        }
        dispatch(addtoGuestCart({ data: updatedProducts }));
    };

    const handleValidateAddExistingGuestProduct = (productQuantity, product, quantity) => {
        if (Number(product.is_unlimited_stock)) {
            if (productQuantity?.find(prdct => prdct?.product_id == product?.product_id)?.qty >= Number(product?.total_allowed_quantity)) {
                toast.error(t("max_cart_limit_error"));
            }
            else {
                AddToGuestCart(product?.product_id, product?.product_variant_id, quantity, 1);
            }
        }
        else {
            if (productQuantity?.find(prdct => prdct?.product_id == product?.product_id)?.qty >= Number(product?.total_allowed_quantity)) {
                toast.error(t("max_cart_limit_error"));
            }
            else if (productQuantity?.find(prdct => prdct?.product_id == product?.product_id)?.qty >= Number(product?.stock)) {
                toast.error(t("limited_product_stock_error"));
            }
            else {
                AddToGuestCart(product?.product_id, product?.product_variant_id, quantity, 1);
            }
        }
    };

    return (
        <>
            {!isNetworkError ?
                <section id='viewcart' className='viewcart'>
                    <div className='cover'>
                        <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                        <div className='title'>
                            <h3>{t("cart")}</h3>
                            <span><Link to='/' className='text-light text-decoration-none'>{t("home")} / </Link></span><span className='active'>{t('cart')}</span>
                        </div>

                    </div>

                    <div className="view-cart-container">
                        <div className='container'>

                            {iscartEmpty ? (
                                <div className='empty-cart co-12'>
                                    <img src={EmptyCart} onError={placeHolderImage} alt='empty-cart'></img>
                                    <p>{t("empty_cart_list_message")}</p>
                                    <span>{t("empty_cart_list_description")}</span>
                                    <button type='button' onClick={() => {
                                        navigate('/products');
                                    }}>{t("empty_cart_list_button_name")}</button>
                                </div>) : (
                                <>
                                    <>
                                        {isLoader ? <Loader screen='full' background='none' /> : null}
                                        <div className="row justify-content-center">

                                            <div className='viewcart-product-wrapper col-8'>
                                                <div className='product-heading'>
                                                    <h3>{t("your_cart")}</h3>
                                                    <span>{t("there_are")} </span><span className='title'>{cart?.isGuest === false ? cart?.cartProducts?.length : cart?.guestCart?.length}</span> <span> {t("product_in_your_cart")}  </span>
                                                </div>

                                                <table className='products-table table'>
                                                    <thead>
                                                        <tr>
                                                            <th className='first-column'>{t("product")}</th>
                                                            <th className='hide-mobile'>{t("unit")}</th>
                                                            <th>{t("price")}</th>
                                                            <th>{("quantity")}</th>
                                                            <th className='hide-mobile'>{t("sub_total")}</th>
                                                            <th className='last-column'>{t("remove")}</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {cartProducts?.map((product, index) => {
                                                            if (cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.product_variant_id)?.qty > 0 || cart?.guestCart?.find((prdct) => prdct?.product_variant_id == product?.product_variant_id)?.qty > 0) {
                                                                return (
                                                                    <tr key={index} className={`${!product.status ? "danger" : ""}`}>
                                                                        <th className='products-image-container first-column'>
                                                                            <div className='image-container'>
                                                                                <img onError={placeHolderImage} src={product.image_url} alt='product'></img>
                                                                            </div>

                                                                            <div className=''>
                                                                                <span>{product.measurement} {product.unit_code} | {product.name}</span>

                                                                            </div>
                                                                        </th>

                                                                        <th className='unit hide-mobile'>
                                                                            {product.qty}
                                                                        </th>

                                                                        <th className='price'>
                                                                            {setting.setting && setting.setting.currency}
                                                                            {(product.discounted_price === 0 ? product.price.toFixed(setting.setting && setting.setting.decimal_point) : product.discounted_price.toFixed(setting.setting && setting.setting.decimal_point))}
                                                                        </th>

                                                                        <th className='quantity'>
                                                                            <div>
                                                                                <button
                                                                                    type='button'
                                                                                    onClick={() => {
                                                                                        if (cart?.isGuest && product.qty > 1) {
                                                                                            AddToGuestCart(product.product_id, product.product_variant_id, Number(cart?.guestCart?.find((prdct) => prdct?.product_variant_id == product?.product_variant_id)?.qty) - 1, 1);
                                                                                        } else {
                                                                                            if (product.qty > 1) {
                                                                                                addtoCart(product.product_id, product.product_variant_id, cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.product_variant_id)?.qty - 1);
                                                                                            }
                                                                                        }

                                                                                    }}>
                                                                                    <BiMinus fill='#fff' fontSize={'2rem'} />
                                                                                </button>

                                                                                <span >{cart?.isGuest === false ?
                                                                                    cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.product_variant_id)?.qty :
                                                                                    cart?.guestCart?.find((prdct) => prdct?.product_variant_id == product?.product_variant_id)?.qty}</span>

                                                                                <button
                                                                                    type='button'
                                                                                    onClick={() => {
                                                                                        if (cart?.isGuest) {
                                                                                            const productQuantity = getProductQuantities(cart?.guestCart);
                                                                                            handleValidateAddExistingGuestProduct(
                                                                                                productQuantity,
                                                                                                product,
                                                                                                Number(product.qty) + 1
                                                                                            );
                                                                                        } else {
                                                                                            const productQuantity = getProductQuantities(cart?.cartProducts);
                                                                                            if (Number(product.is_unlimited_stock) === 1) {
                                                                                                if (productQuantity?.find(prdct => prdct?.product_id == product?.product_id)?.qty < Number(product?.total_allowed_quantity)) {
                                                                                                    addtoCart(product.product_id, product.product_variant_id, cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.product_variant_id)?.qty + 1);
                                                                                                } else {
                                                                                                    toast.error(t("max_cart_limit_error"));
                                                                                                }
                                                                                            } else {
                                                                                                if (Number(product.qty) >= Number(product.stock)) {
                                                                                                    toast.error(t("out_of_stock_message"));

                                                                                                } else if (productQuantity?.find(prdct => prdct?.product_id == product?.product_id)?.qty >= Number(product?.total_allowed_quantity)) {
                                                                                                    toast.error(t("max_cart_limit_error"));
                                                                                                }
                                                                                                else {
                                                                                                    addtoCart(product.product_id, product.product_variant_id, cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == product?.product_variant_id)?.qty + 1);
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }}>
                                                                                    <BsPlus fill='#fff' fontSize={'2rem'} />
                                                                                </button>
                                                                            </div>

                                                                        </th>

                                                                        <th className='subtotal hide-mobile'>
                                                                            {setting.setting && setting.setting.currency}

                                                                            {((product.discounted_price === 0 ? product.price.toFixed(setting.setting?.decimal_point) : product.discounted_price.toFixed(setting.setting && setting.setting.decimal_point)) * product.qty).toFixed(setting.setting && setting.setting.decimal_point)}
                                                                        </th>

                                                                        <th className='remove last-column'>
                                                                            <button
                                                                                whiletap={{ scale: 0.8 }}
                                                                                type='button'
                                                                                onClick={() => {
                                                                                    if (cart?.isGuest) {
                                                                                        RemoveFromGuestCart(product.product_variant_id);
                                                                                    } else {
                                                                                        removefromCart(product.product_id, product.product_variant_id);
                                                                                    }
                                                                                }}>
                                                                                <RiDeleteBinLine fill='red' fontSize={'2.985rem'} />
                                                                            </button>
                                                                        </th>
                                                                    </tr>
                                                                );
                                                            }
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="billing col-3">
                                                {cart?.isGuest === false ?
                                                    <div className="promo-section mb-3">
                                                        <div className="heading">
                                                            <span>{t("coupon")}</span>
                                                        </div>
                                                        <div className="promo-wrapper">
                                                            <div className="promo-container">
                                                                <div className="promo-button ">
                                                                    <span className="">{t("have_coupon")}</span>
                                                                    <button className="btn" onClick={() => setShowPromoOffcanvas(true)}>{t("view_coupon")}</button>
                                                                </div>
                                                                {cart.cart && cart.promo_code ?
                                                                    <>
                                                                        <div className="promo-code">
                                                                            <div className="">
                                                                                <span><RiCoupon2Fill size={26} fill='var(--secondary-color)' /></span>
                                                                            </div>
                                                                            <div className="d-flex flex-column">
                                                                                <span className='promo-name'>{cart.promo_code.promo_code}</span>
                                                                                <span className='promo-discount-amount'>{cart.promo_code.message}</span>
                                                                            </div>
                                                                            <div className="d-flex flex-column">
                                                                                <span>{setting.setting && setting.setting.currency} {cart.promo_code.discount.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                                <span className='promo-remove' onClick={() => {
                                                                                    dispatch(clearCartPromo());
                                                                                    toast.info("Coupon Removed");
                                                                                }}> {t("remove")}</span>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                    : <></>}
                                                            </div>
                                                        </div>

                                                    </div> : null}
                                                <div className='cart-summary-wrapper'>
                                                    <div className='heading'>
                                                        <span >{t("cart")} {t("total")}</span>
                                                    </div>
                                                    {cart.cartSubTotal === null
                                                        ? (<div className="d-flex justify-content-center">
                                                            <div className="spinner-border" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        </div>)
                                                        : (
                                                            <div className='summary'>
                                                                <div className='d-flex justify-content-between'>
                                                                    <span>{t("sub_total")}</span>
                                                                    <div className='d-flex align-items-center'>
                                                                        {setting.setting && setting.setting.currency}
                                                                        <span>{
                                                                            cart?.isGuest === false ?
                                                                                (cart?.cartSubTotal)?.toFixed(setting.setting && setting.setting.decimal_point)
                                                                                :
                                                                                guestCartSubTotal?.toFixed(setting.setting && setting.setting.decimal_point)
                                                                        }</span>
                                                                    </div>
                                                                </div>
                                                                {cart.promo_code && <>
                                                                    <div className='d-flex justify-content-between'>
                                                                        <span>{t("discount")}</span>
                                                                        <div className='d-flex align-items-center'>

                                                                            <span>-   {setting.setting && setting.setting.currency}{(cart?.promo_code.discount)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                        </div>
                                                                    </div>
                                                                </>}
                                                                <div className='d-flex justify-content-center mt-3 button-container'>
                                                                    <button
                                                                        type='button'
                                                                        onClick={() => {
                                                                            // console.log("cart", cart?.isGuest)
                                                                            if (cart?.isGuest) {
                                                                                // toast.error("login");
                                                                                toast.error(t("login_to_access_checkout_page"));
                                                                            } else {
                                                                                stockValidation();
                                                                            }
                                                                        }}
                                                                        className='checkout cursorPointer'>
                                                                        {t("proceed_to_checkout")}
                                                                    </button>
                                                                </div>

                                                            </div>)}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                </>
                            )}
                        </div>
                    </div>
                    <Promo show={showPromoOffcanvas} setShow={setShowPromoOffcanvas} />
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

export default ViewCart;
