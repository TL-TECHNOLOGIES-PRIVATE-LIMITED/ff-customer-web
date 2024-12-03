import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import "./productVariantModal.css"
import { useTranslation } from 'react-i18next';
import { FaMinus, FaPlus, FaShoppingBasket } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import * as newApi from "../../api/apiCollection"
import { addGuestCartTotal, addtoGuestCart, setCart, setCartProducts, setCartSubTotal, subGuestCartTotal } from '../../model/reducer/cartReducer';
import { toast } from 'react-toastify';

function ProductVariantModal({ product, showVariantModal, setShowVariantModal }) {


    const { t } = useTranslation();
    const dispatch = useDispatch();

    const setting = useSelector(state => (state.setting));
    const cart = useSelector(state => (state.cart));
    const user = useSelector(state => (state.user));

    const handleClose = () => setShowVariantModal(false);

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
                const updatedProducts = cart?.cartProducts?.filter(product => ((product?.product_id != productId) || (product?.product_variant_id != variantId)));
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
    const handleValidateAddNewProduct = (productQuantity, product, variant) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty
        if ((productQty) >= Number(product?.total_allowed_quantity)) {
            toast.error('Oops, Limited Stock Available');
        }
        else if (Number(product.is_unlimited_stock)) {
            addToCart(product.id, variant?.id, 1);
        } else {
            if (variant?.status) {
                addToCart(product.id, variant?.id, 1);
            } else {
                toast.error('Oops, Limited Stock Available');
            }
        }

    };
    const handleValidateAddExistingProduct = (productQuantity, product, variant) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty
        if (Number(product.is_unlimited_stock)) {
            if (productQty < Number(product?.total_allowed_quantity)) {
                addToCart(product.id, variant?.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == variant?.id)?.qty + 1);
            } else {
                toast.error('Apologies, maximum product quantity limit reached!');
            }
        } else {
            if (productQty >= Number(variant?.stock)) {
                toast.error(t("out_of_stock_message"));
            }
            else if (Number(productQty) >= Number(product.total_allowed_quantity)) {
                toast.error('Apologies, maximum product quantity limit reached');
            } else {
                addToCart(product.id, variant?.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == variant?.id)?.qty + 1);
            }
        }
    };
    const handleAddNewProductGuest = (productQuantity, product, variant) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty
        if (Number(productQty || 0) < Number(product.total_allowed_quantity)) {
            AddToGuestCart(product, product.id, variant?.id, 1, 0, variant, "add");
        } else {
            toast.error(t("out_of_stock_message"));
        }
    };
    const AddToGuestCart = (product, productId, productVariantId, Qty, isExisting, variant, flag) => {
        const finalPrice = variant?.discounted_price !== 0 ? variant?.discounted_price : variant?.price
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
                        return product;
                    }

                });

            } else {
                if (flag == "add") {
                    dispatch(addGuestCartTotal({ data: finalPrice }));
                } else if (flag == "remove") {
                    dispatch(subGuestCartTotal({ data: finalPrice }));
                }
                updatedProducts = cart?.guestCart?.filter(product => {
                    return (
                        product?.product_id != productId || product?.product_variant_id != productVariantId
                    )
                }
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
            const productData = { product_id: productId, product_variant_id: productVariantId, qty: Qty };
            dispatch(addtoGuestCart({ data: [...cart?.guestCart, productData] }));
        }
    };
    const handleValidateAddExistingGuestProduct = (productQuantity, product, quantity, variant) => {
        const productQty = productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty;
        console.log("product qty", quantity)
        if (Number(product.is_unlimited_stock)) {
            if (productQty >= Number(product?.total_allowed_quantity)) {
                toast.error('Apologies, maximum product quantity limit reached');
            }
            else {
                AddToGuestCart(product, product?.id, variant?.id, quantity, 1, variant, "add");
            }
        }
        else {
            if (productQty >= Number(variant?.stock)) {
                toast.error('Oops, Limited Stock Available');
            }
            else if (productQty >= Number(product?.total_allowed_quantity)) {
                toast.error('Apologies, maximum cart quantity limit reached');
            }
            else {

                AddToGuestCart(product, product?.id, variant?.id, quantity, 1, variant, "add");
            }
        }
    };

    return (
        <>
            <Modal show={showVariantModal} onHide={handleClose} size='md' centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("productVariants")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='product-info'>
                        <img src={product?.image_url} />
                        <p>{product?.name}</p>
                    </div>
                    <div className='product-variants'>
                        {product?.variants?.map((variant) => {
                            return (
                                <div className='row d-flex align-items-center variant-row'>
                                    <div className='col-4 col-lg-7'>{`${variant?.measurement} ${variant?.stock_unit_name}`}</div>
                                    {variant?.is_unlimited_stock === 0 && variant?.stock <= 0 ? <></> :
                                        <div className='col-4 col-lg-2 mr-4 variant-price'>{setting?.setting?.currency}{variant?.discounted_price == 0 ? variant?.price : variant?.discounted_price}</div>
                                    }
                                    {variant?.is_unlimited_stock === 0 && variant?.stock <= 0 ? <span className='col-5 mr-4 variant-out-of-stock'>{t("OutOfStock")} </span> :
                                        <div className='col-4 col-lg-3 '>

                                            {cart?.isGuest === false && cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == variant?.id)?.qty > 0 ||
                                                cart?.isGuest === true && cart?.guestCart?.find((prdct) => prdct?.product_variant_id === variant?.id)?.qty > 0 ? <div className='cart-variant-count-btn'><button
                                                    onClick={() => {
                                                        if (cart?.isGuest) {
                                                            AddToGuestCart(
                                                                product,
                                                                product?.id,
                                                                variant?.id,
                                                                cart?.guestCart?.find((prdct) => prdct?.product_variant_id == variant?.id)?.qty - 1,
                                                                1,
                                                                variant,
                                                                "remove"
                                                            );
                                                        } else {
                                                            if (cart?.cartProducts?.find((prdct) => prdct?.product_variant_id == variant?.id).qty == 1) {
                                                                removeFromCart(product?.id, variant?.id)
                                                            } else {
                                                                addToCart(product.id, variant.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == variant?.id)?.qty - 1);
                                                            }
                                                        }
                                                    }}
                                                    className='qty-change-btn'
                                                ><FaMinus /></button>

                                                <input value={
                                                    cart.isGuest === false ?
                                                        cart?.cartProducts?.find(prdct => prdct?.product_variant_id == variant.id)?.qty
                                                        : cart?.guestCart?.find(prdct => prdct?.product_variant_id == variant.id)?.qty
                                                } disabled min='1' type='number' max={variant?.stock} />

                                                <button onClick={() => {
                                                    if (cart?.isGuest) {
                                                        const productQuantity = getProductQuantities(cart?.guestCart)
                                                        handleValidateAddExistingGuestProduct(
                                                            productQuantity,
                                                            product,
                                                            cart?.guestCart?.find(prdct => prdct?.product_id == product?.id && prdct?.product_variant_id == variant?.id)?.qty + 1,
                                                            variant
                                                        )
                                                    } else {
                                                        const quantity = getProductQuantities(cart?.cartProducts)
                                                        handleValidateAddExistingProduct(quantity, product, variant)
                                                    }
                                                }} className='qty-change-btn'><FaPlus /></button>
                                            </div> : <button className='product-cart-btn' onClick={() => {
                                                if (cart?.isGuest) {
                                                    const quantity = getProductQuantities(cart?.cartProducts)
                                                    handleAddNewProductGuest(quantity, product, variant)
                                                } else {
                                                    const quantity = getProductQuantities(cart?.cartProducts)
                                                    handleValidateAddNewProduct(quantity, product, variant)
                                                }

                                            }} ><FaShoppingBasket className='mx-2' size={20} />Add</button>}
                                        </div>
                                    }


                                </div>
                            )
                        })}

                    </div>
                </Modal.Body>

            </Modal>
        </>
    );
}


export default ProductVariantModal
