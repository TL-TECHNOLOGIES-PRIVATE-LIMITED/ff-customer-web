import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../cart/cart.css';
import './favorite.css';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import EmptyCart from '../../utils/zero-state-screens/Empty_Cart.svg';
import { useNavigate, Link } from 'react-router-dom';
import { BsPlus } from "react-icons/bs";
import { BiMinus } from 'react-icons/bi';
import api from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';
import { useTranslation } from 'react-i18next';
import { setCart, setSellerFlag } from '../../model/reducer/cartReducer';
import { setFavourite } from '../../model/reducer/favouriteReducer';
import Popup from '../same-seller-popup/Popup';
import * as newApi from "../../api/apiCollection";


const Favorite = React.memo(() => {
    const closeCanvas = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const favorite = useSelector(state => (state.favourite));
    const setting = useSelector(state => (state.setting));
    const city = useSelector(state => (state.city));
    const cart = useSelector(state => (state.cart));
    const user = useSelector(state => (state.user));
    const [isfavoriteEmpty, setisfavoriteEmpty] = useState(false);
    const [isLoader, setisLoader] = useState(false);
    const [p_id, setP_id] = useState(0);
    const [p_v_id, setP_V_id] = useState(0);
    const [qnty, setQnty] = useState(0);

    useEffect(() => {
        if (favorite.favorite === null && favorite.status === 'fulfill') {
            setisfavoriteEmpty(true);
        }
        else {
            setisfavoriteEmpty(false);
        }
    }, [favorite]);

    // console.log(p_id, p_v_id, qnty);

    //Add to Cart
    const addtoCart = async (product_id, product_variant_id, qty) => {
        setP_id(product_id);
        setP_V_id(product_variant_id);
        setQnty(qty);
        setisLoader(true);
        await api.addToCart(user?.jwtToken, product_id, product_variant_id, qty)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    await api.getCart(user?.jwtToken, city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            setisLoader(false);
                            if (res.status === 1)
                                dispatch(setCart({ data: res }));
                            //dispatch({ type: ActionTypes.SET_CART, payload: res });
                        });
                }
                else if (result?.data?.one_seller_error_code == 1) {
                    dispatch(setSellerFlag({ data: 1 }));
                    // console.log(result.message);
                    // toast.error(t(`${result.message}`));
                } else {
                    toast.error(result.message);
                }
            });
        setisLoader(false);
    };

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        setisLoader(true);
        await api.removeFromCart(user?.jwtToken, product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    await api.getCart(user?.jwtToken, city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            setisLoader(false);
                            if (res.status === 1) {
                                dispatch(setCart({ data: res }));
                                // dispatch({ type: ActionTypes.SET_CART, payload: res });
                            }
                            else {
                                dispatch(setCart({ data: null }));
                                // dispatch({ type: ActionTypes.SET_CART, payload: null });
                            }
                        })
                        .catch(error => console.log(error));
                }
                else {
                    setisLoader(false);
                    toast.error(result.message);
                }
            })
            .catch(error => console.log(error));
    };

    //remove from favorite
    const removefromFavorite = async (product_id) => {
        setisLoader(true);
        await api.removeFromFavorite(user?.jwtToken, product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    await api.getFavorite(user?.jwtToken, city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            setisLoader(false);
                            if (res.status === 1) {
                                dispatch(setFavourite({ data: res }));
                                // dispatch({ type: ActionTypes.SET_FAVORITE, payload: res });
                            }
                            else {
                                dispatch(setFavourite({ data: null }));
                            }
                            // dispatch({ type: ActionTypes.SET_FAVORITE, payload: null });
                        });
                }
                else {
                    setisLoader(false);
                    toast.error(result.message);
                }
            });

    };
    const { t } = useTranslation();
    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };
    return (
        <div tabIndex="-1" className={`cart-sidebar-container offcanvas offcanvas-end`} id="favoriteoffcanvasExample" aria-labelledby="favoriteoffcanvasExampleLabel">
            <div className='cart-sidebar-header'>
                <h5>{t("saved")}</h5>
                <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeCanvas}><AiOutlineCloseCircle fill='black' /></button>
            </div>

            {!favorite.favorite
                ? (
                    <div className='empty-cart'>
                        <img onError={placeHolderImage} src={EmptyCart} alt='empty-cart'></img>
                        <p>{t("enter_wishlist_message")}</p>

                        <span>{t("enter_wishlist_description")}</span>
                        <button type='button' className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => {
                            navigate('/products');
                        }}>{t("empty_cart_list_button_name")}</button>
                    </div>)
                : (
                    <>
                        {favorite.favorite === null
                            ? (
                                <Loader width='100%' height='100%' />

                            ) : (
                                <>
                                    {isLoader ? <Loader screen='full' background='none' /> : null}
                                    <div className='cart-sidebar-product'>
                                        <div className='products-header'>
                                            <span>{t("products")}</span>
                                            <span>{t("price")}</span>
                                        </div>

                                        <div className='products-container'>
                                            {favorite.favorite.status !== 0 && favorite.favorite.data.map((product, index) => (
                                                <div key={index} className='cart-card'>
                                                    <div className='left-wrapper'>
                                                        <Link to={`/product/${product.slug}`}>

                                                            <div className='image-container'>
                                                                <img onError={placeHolderImage} src={product.image_url} alt='product'></img>
                                                            </div>
                                                        </Link>

                                                        <div className='product-details'>
                                                            <span>{product.name}</span>
                                                            <span>{product.variants[0] && product.variants[0].measurement + ` ` + product.variants[0].stock_unit_name}</span>

                                                            {
                                                                cart.cart ?
                                                                    (cart.cart && cart?.cart?.data?.cart?.find(element => element.product_variant_id === product.variants[0]?.id) ? (
                                                                        <div className='counter'>
                                                                            {cart?.cart?.data?.cart?.find(element => element.product_variant_id === product.variants[0]?.id) &&
                                                                                <>
                                                                                    <button type='button' onClick={() => {
                                                                                        var val = parseInt(document.getElementById(`input-cart-sidebar${index}`).innerHTML);
                                                                                        if (val > 1) {
                                                                                            document.getElementById(`input-cart-sidebar${index}`).innerHTML = val - 1;
                                                                                            addtoCart(cart.cart.data.cart.find(element => element.product_variant_id === product.variants[0].id).product_id, cart.cart.data.cart.find(element => element.product_variant_id === product.variants[0].id).product_variant_id, document.getElementById(`input-cart-sidebar${index}`).innerHTML);
                                                                                        } else {
                                                                                            removefromCart(cart.cart.data.cart.find(element => element.product_variant_id === product.variants[0].id).product_id, cart.cart.data.cart.find(element => element.product_variant_id === product.variants[0].id).product_variant_id);
                                                                                            // removefromFavorite(product.id)
                                                                                        }
                                                                                    }}><BiMinus fill='#fff' /></button>
                                                                                    <span id={`input-cart-sidebar${index}`} >{cart.cart.data.cart.find(element => element.product_variant_id === product.variants[0].id).qty}</span>
                                                                                    <button type='button' onClick={() => {
                                                                                        var val = parseInt(document.getElementById(`input-cart-sidebar${index}`).innerHTML);
                                                                                        const element = cart.cart.data.cart.find(element => element.product_variant_id === product.variants[0].id);
                                                                                        if (Number(element.is_unlimited_stock) === 1) {
                                                                                            if (Number(val) < Number(setting.setting.max_cart_items_count)) {
                                                                                                addtoCart(element.product_id, element.product_variant_id, Number(document.getElementById(`input-cart-sidebar${index}`).innerHTML) + 1);
                                                                                                document.getElementById(`input-cart-sidebar${index}`).innerHTML = val + 1;
                                                                                            } else {
                                                                                                toast.error('Apologies, maximum product quantity limit reached!');
                                                                                            }
                                                                                        } else {
                                                                                            if (Number(val) >= Number(element.stock)) {
                                                                                                toast.error(t("out_of_stock_message"));
                                                                                            } else if (Number(val) >= Number(setting.setting.max_cart_items_count)) {
                                                                                                toast.error('Apologies, maximum product quantity limit reached!');
                                                                                            } else {
                                                                                                addtoCart(element.product_id, element.product_variant_id, Number(document.getElementById(`input-cart-sidebar${index}`).innerHTML) + 1);
                                                                                                document.getElementById(`input-cart-sidebar${index}`).innerHTML = val + 1;
                                                                                            }
                                                                                        }
                                                                                    }}><BsPlus fill='#fff' /></button>
                                                                                </>
                                                                            }
                                                                        </div>
                                                                    ) : (
                                                                        <button type='button' id={`Add-to-cart-favoritesidebar${index}`} className='add-to-cart active'
                                                                            onClick={() => {
                                                                                if (user?.jwtToken !== "") {
                                                                                    if (product.variants[0].status) {
                                                                                        addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1);
                                                                                        setP_id(product.id);
                                                                                        setP_V_id(product.variants[0].id);
                                                                                        setQnty(product.variants[0].cart_count + 1);
                                                                                    }
                                                                                    else {
                                                                                        toast.error(t("out_of_stock_message"));
                                                                                    }
                                                                                } else {
                                                                                    toast.error(t("required_login_message_for_cartRedirect"));
                                                                                }
                                                                            }}
                                                                        >{t("add_to_cart")}</button>
                                                                    )) :
                                                                    (
                                                                        <button type='button' id={`Add-to-cart-favoritesidebar${index}`} className='add-to-cart active'
                                                                            onClick={() => {
                                                                                if (user?.jwtToken !== "") {
                                                                                    if (Number(product.variants[0].stock > 1)) {
                                                                                        addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1);
                                                                                        setP_id(product.id);
                                                                                        setP_V_id(product.variants[0].id);
                                                                                        setQnty(product.variants[0].cart_count + 1);
                                                                                    }
                                                                                    else {
                                                                                        toast.error(t("out_of_stock_message"));

                                                                                    }
                                                                                } else {
                                                                                    toast.error(t("required_login_message_for_cartRedirect"));
                                                                                }
                                                                            }}
                                                                        >{t("add_to_cart")}</button>
                                                                    )
                                                            }

                                                        </div>
                                                    </div>

                                                    <div className='cart-card-end'>
                                                        <div className='d-flex align-items-center' style={{ fontSize: "1.855rem", color: "var(--secondary-color)" }}>
                                                            {setting.setting && setting.setting.currency}  <span id={`price${index}-cart-sidebar`}> {product.variants.length > 0 && (product.variants[0].discounted_price == 0 ? product.variants[0].price.toFixed(setting.setting && setting.setting.decimal_point) : product.variants[0].discounted_price.toFixed(setting.setting && setting.setting.decimal_point))}</span>
                                                        </div>

                                                        <button type='button' className='remove-product' onClick={() => removefromFavorite(product.id)}>{t("delete")}</button>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='cart-sidebar-footer'>
                                        <div className='button-container'>
                                            <button type='button' className='view-cart' onClick={() => {
                                                closeCanvas.current.click();
                                                navigate('/wishlist');
                                            }}>{t("viewSaved")}</button>
                                        </div>
                                    </div>
                                    <Popup
                                        product_id={p_id}
                                        product_variant_id={p_v_id}
                                        quantity={qnty}
                                        setisLoader={setisLoader}
                                        toast={toast}
                                        city={city}
                                    />
                                </>
                            )}
                    </>

                )}

        </div>
    );
});

export default Favorite;
