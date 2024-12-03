import React, { useEffect, useState } from 'react'
import "./horizontalProductcard.css"
import { Rate } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { FaMinus, FaPlus, FaShoppingBasket } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdArrowDropdown } from 'react-icons/io';
import QuickViewModal from './QuickViewModal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as newApi from "../../api/apiCollection"
import { toast } from 'react-toastify';
import { addGuestCartTotal, addtoGuestCart, setCart, setCartProducts, setCartSubTotal, subGuestCartTotal } from '../../model/reducer/cartReducer';
import ProductVariantModal from './ProductVariantModal';
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';
import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import { addFavoriteProductId } from '../../model/reducer/favouriteReducer';
import VegIcon from "../../utils/Icons/VegIcon.svg";
import NonVegIcon from "../../utils/Icons/NonVegIcon.svg";

const HorizonalProduct = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const { t } = useTranslation();
    const setting = useSelector(state => (state.setting));
    const cart = useSelector(state => (state.cart))
    const user = useSelector(state => (state.user))
    const favoriteProducts = useSelector(state => (state.favourite))

    const [p_id, setP_id] = useState(0);
    const [p_v_id, setP_V_id] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setselectedProduct] = useState({});
    const [selectedVariant, setSelectedVariant] = useState()
    const [showVariantModal, setShowVariantModal] = useState(false)


    useEffect(() => {
        const inStockVariant = product?.variants?.find((variant) => variant?.is_unlimited_stock === 0 && variant?.stock > 0)
        if (inStockVariant == undefined) {
            setSelectedVariant(product?.variants[0])
        } else {
            setSelectedVariant(inStockVariant)
        }
    }, [])

    const addToCart = async (productId, productVId, qty) => {
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

    const removeFromCart = async (productId, variantId) => {
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

    const getProductQuantities = (products) => {
        return Object.entries(products?.reduce((quantities, product) => {
            const existingQty = quantities[product.product_id] || 0;
            return { ...quantities, [product.product_id]: existingQty + product.qty };
        }, {})).map(([productId, qty]) => ({
            product_id: parseInt(productId),
            qty
        }));
    }

    const addToFavorite = async (prdctId) => {
        try {
            if (user?.jwtToken) {
                const res = await newApi.addToFavorite({ product_id: prdctId });
                if (res.status == 1) {
                    toast.success(res.message)
                    dispatch(addFavoriteProductId({ data: prdctId }))
                } else {
                    toast.error(res.message)
                }
            } else {
                toast.error(t("required_login_message_for_wishlist"))
            }

        } catch (error) {
            console.log(error)
        }
    }

    const handleValidateAddNewProduct = (productQuantity, product) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty

        if ((productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty || 0) >= Number(product?.total_allowed_quantity)) {
            toast.error('Oops, Limited Stock Available');
        }
        else if (Number(product.is_unlimited_stock)) {
            addToCart(product.id, product?.variants?.[0].id, 1);
        } else {
            if (selectedVariant?.status) {
                addToCart(product.id, selectedVariant?.id, 1);
            } else {
                toast.error('Oops, Limited Stock Available');
            }
        }

    };

    const handleValidateAddExistingProduct = (productQuantity, product) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty
        if (Number(product.is_unlimited_stock)) {
            if (productQty < Number(product?.total_allowed_quantity)) {
                addToCart(product.id, selectedVariant?.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty + 1);
            } else {
                toast.error('Apologies, maximum product quantity limit reached!');
            }
        } else {
            if (productQty >= Number(selectedVariant?.stock)) {
                toast.error(t("out_of_stock_message"));
            }
            else if (Number(productQty) >= Number(product.total_allowed_quantity)) {
                toast.error('Apologies, maximum product quantity limit reached');
            } else {
                addToCart(product.id, selectedVariant?.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty + 1);
            }
        }
    };

    const handleAddNewProductGuest = (productQuantity, product) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty
        if (Number(productQty || 0) < Number(product.total_allowed_quantity)) {
            AddToGuestCart(product, product.id, selectedVariant?.id, 1, 0, "add");
        } else {
            toast.error(t("out_of_stock_message"));
        }
    };

    const AddToGuestCart = (product, productId, productVariantId, Qty, isExisting, flag) => {
        const finalPrice = selectedVariant?.discounted_price !== 0 ? selectedVariant?.discounted_price : selectedVariant?.price
        if (isExisting) {
            let updatedProducts;
            if (Qty !== 0) {
                if (flag == "add") {
                    dispatch(addGuestCartTotal({ data: finalPrice }));
                } else if (flag == "remove") {
                    dispatch(subGuestCartTotal({ data: finalPrice }));
                }
                updatedProducts = cart?.guestCart?.map((product) => {

                    if (product?.product_id == productId && product?.product_variant_id == productVariantId) {
                        return { ...product, qty: Qty };
                    } else {
                        // dispatch(addGuestCartTotal({ data: finalPrice }));
                        return product;
                    }

                });
            } else {
                if (flag == "add") {
                    dispatch(addGuestCartTotal({ data: finalPrice }));
                } else if (flag == "remove") {
                    dispatch(subGuestCartTotal({ data: finalPrice }));
                }
                updatedProducts = cart?.guestCart?.filter(product =>
                    product?.product_id != productId && product?.product_variant_id != productVariantId
                );
                // dispatch(subGuestCartTotal({ data: finalPrice }));
            }

            dispatch(addtoGuestCart({ data: updatedProducts }));

        } else {
            if (flag == "add") {
                dispatch(addGuestCartTotal({ data: finalPrice }));
            } else if (flag == "remove") {
                dispatch(subGuestCartTotal({ data: finalPrice }));
            }
            // dispatch(addGuestCartTotal({ data: finalPrice }))
            const productData = { product_id: productId, product_variant_id: productVariantId, qty: Qty, productPrice: finalPrice };
            dispatch(addtoGuestCart({ data: [...cart?.guestCart, productData] }));
        }
    };

    const handleValidateAddExistingGuestProduct = (productQuantity, product, quantity) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty;
        if (Number(product.is_unlimited_stock)) {
            if (productQty >= Number(product?.total_allowed_quantity)) {
                toast.error('Apologies, maximum product quantity limit reached');
            }
            else {
                AddToGuestCart(product, product?.id, selectedVariant?.id, quantity, 1, "add");
            }
        }
        else {
            if (productQty >= Number(selectedVariant?.stock)) {
                toast.error('Oops, Limited Stock Available');
            }
            else if (productQty >= Number(product?.total_allowed_quantity)) {
                toast.error('Apologies, maximum cart quantity limit reached');
            }
            else {
                AddToGuestCart(product, product?.id, selectedVariant?.id, quantity, 1, "add");
            }
        }
    };


    const calculateDiscount = (discountPrice, actualPrice) => {
        const difference = actualPrice - discountPrice;
        const actualDiscountPrice = (difference / actualPrice)
        return actualDiscountPrice * 100;
    }

    const handleVariantModal = (product) => {
        if (product?.variants?.length > 1) {
            setShowVariantModal(true)
        }
    }

    const handleQuantityDecrease = () => {

        if (cart?.isGuest) {
            AddToGuestCart(
                product,
                product?.id,
                selectedVariant?.id,
                cart?.guestCart?.find((prdct) => prdct?.product_variant_id == selectedVariant?.id)?.qty - 1,
                1,
                "remove"
            );
        } else {
            if (cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == selectedVariant?.id).qty == 1) {
                removeFromCart(product?.id, selectedVariant?.id)
            } else {
                addToCart(product.id, selectedVariant.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty - 1);
            }
        }
    }

    const handleQuantityIncrease = () => {
        if (cart?.isGuest) {
            const productQuantity = getProductQuantities(cart?.guestCart)
            handleValidateAddExistingGuestProduct(
                productQuantity,
                product,
                cart?.guestCart?.find(prdct => prdct?.product_id == product?.id && prdct?.product_variant_id == selectedVariant?.id)?.qty + 1
            )
        } else {
            const quantity = getProductQuantities(cart?.cartProducts)
            handleValidateAddExistingProduct(quantity, product)
        }
    }

    const handleIntialAddToCart = () => {

        if (cart?.isGuest) {
            const quantity = getProductQuantities(cart?.cartProducts)
            handleAddNewProductGuest(quantity, product)
        } else {
            const quantity = getProductQuantities(cart?.cartProducts)
            handleValidateAddNewProduct(quantity, product)
        }
    }

    const isProductAvailabel = ((product?.variants?.length <= 1 && product?.variants?.[0]?.is_unlimited_stock == 0 && product?.variants?.[0]?.stock == 0) || (selectedVariant?.stock == 0 && selectedVariant?.is_unlimited_stock == 0))


    const isProductAlreadyAdded = ((cart?.isGuest === false && cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == selectedVariant?.id)?.qty > 0) ||
        (cart?.isGuest === true && cart?.guestCart?.find((prdct) => prdct?.product_variant_id === selectedVariant?.id)?.qty > 0))

    const addedQuantity = cart.isGuest === false ?
        cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty
        : cart?.guestCart?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty

    return (
        <div className='horizontal-product-grid '>
            <div className='row' >
                <div className="product-image col-6" >
                    <div className='image-container'>
                        <a className="image" onClick={() => navigate(`/product/${product.slug}`)}>
                            <ImageWithPlaceholder src={product.image_url} alt={product?.slug} />
                        </a>
                        {product?.indicator ?
                            <div className='product-vegen-type'>
                                {product?.indicator == 1 ? <img src={VegIcon} alt="Veg icons" /> : <img src={NonVegIcon} alt="non Veg icons" />}

                            </div>
                            : null}
                        <ul
                            className="product-links">
                            <li onClick={() => addToFavorite(product?.id)}><a data-tip="Add to Wishlist">
                                {favoriteProducts.favouriteProductIds && favoriteProducts.favouriteProductIds?.includes(product?.id) ? <BiSolidHeart size={20} /> : <BiHeart size={20} />}
                            </a></li>
                            <li onClick={() => {
                            }}><a data-tip="Quick View"
                                onClick={() => {
                                    setselectedProduct(product)
                                    setShowModal(true)
                                }}
                            ><i className="fa fa-eye fa-1x"></i></a></li>
                        </ul>
                    </div>
                    {selectedVariant?.discounted_price !== 0 ? <span className="product-discount-label">{calculateDiscount(selectedVariant?.discounted_price, selectedVariant?.price).toFixed(0)}% OFF</span> : <></>}
                </div>
                <div className="horizontal-product-content col-6">
                    <div className='horizontal-product-head'>
                        <div className='horizontal-product-title'>
                            <h3 className="title"> {product?.name} </h3>
                            {product?.average_rating > 0 ? <div className='rating-container'>
                                <Rate
                                    disabled
                                    defaultValue={product?.average_rating}
                                    allowHalf={true}
                                    style={{ fontSize: 15 }}
                                    characterRender={(node, { index }) => (
                                        <span className={index + 1 <= product?.average_rating ? "filledStar" : "emptyStar"}>
                                            {index + 1 <= product?.average_rating ? <StarFilled /> : <StarOutlined />}
                                        </span>
                                    )}
                                />
                                <p>({product?.average_rating.toFixed(2)})</p>
                            </div> : null}
                        </div>
                        <div className='horizontal-product-price'>{
                            <div className="price">{setting.setting.currency}{selectedVariant?.
                                discounted_price !== 0 ? selectedVariant?.
                                discounted_price : selectedVariant?.
                                price}<span>{selectedVariant?.
                                    discounted_price !== 0 && <>
                                        {setting.setting.currency}
                                        {selectedVariant?.
                                            price}
                                    </>}</span>
                            </div>}</div>
                    </div>
                    {
                        isProductAvailabel ? <span className='horizontal-card-variant-out-of-stock '>{t("OutOfStock")} </span> :
                            <div className='horizontal-product-buttons'>
                                <button className='qty-button' onClick={() => handleVariantModal(product)}>{`${selectedVariant?.measurement} ${selectedVariant?.stock_unit_name}`}<span>{product?.variants?.length > 1 ? <IoMdArrowDropdown /> : null}</span></button>
                                {isProductAlreadyAdded ?
                                    <div className='horizontal-cart-count-btn '>
                                        <button onClick={() => { handleQuantityDecrease() }}><FaMinus /></button>
                                        <input value={addedQuantity} disabled min='1' type='number' max={selectedVariant?.stock} />
                                        <button onClick={() => { handleQuantityIncrease() }}><FaPlus /></button>
                                    </div> :
                                    <button className='price-button' onClick={() => { handleIntialAddToCart() }}><FaShoppingBasket className='mx-2' size={20} />Add</button>}
                            </div>
                    }
                </div>
            </div>
            <QuickViewModal selectedProduct={selectedProduct} setselectedProduct={setselectedProduct} showModal={showModal} setShowModal={setShowModal}
                setP_id={setP_id}
                setP_V_id={setP_V_id}
            />
            <ProductVariantModal showVariantModal={showVariantModal} setShowVariantModal={setShowVariantModal} product={product} />
        </div >
    )
}

export default HorizonalProduct