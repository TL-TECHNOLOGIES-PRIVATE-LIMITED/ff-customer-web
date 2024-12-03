import React from "react";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setCart, setCartProducts, setCartSubTotal, setSellerFlag } from "../../model/reducer/cartReducer";
import { useTranslation } from "react-i18next";
import { AiOutlineCloseCircle } from "react-icons/ai";
import "./popup.css";
import api from "../../api/api";

const Popup = React.memo(({ product_id, product_variant_id, quantity, toast, city }) => {
    const cart = useSelector(state => state.cart);
    const user = useSelector(state => state.user);

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const handleYes = async () => {
        await api.removeCart(user?.jwtToken);
        await api.addToCart(user?.jwtToken, product_id, product_variant_id, quantity)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message);
                    const updatedCartCount = [{ product_id: product_id, product_variant_id: product_variant_id, qty: quantity }];
                    dispatch(setCartProducts({ data: updatedCartCount }));
                    dispatch(setCartSubTotal({ data: result?.data?.sub_total }));

                }
                else if (result?.data?.one_seller_error_code == 1) {
                    dispatch(setSellerFlag({ data: 1 }));
                    // console.log(error_)
                    toast.error(t(`${result.message}`));
                }
            });
        dispatch(setSellerFlag({ data: 0 }));
    };

    return (
        <Modal

            show={cart?.same_seller_flag ? true : false}
            size="md"
            centered
            backdrop={"static"}
            onHide={() => dispatch(setSellerFlag({ data: 0 }))}
            className="singleSellerPopup"
        >
            <Modal.Body >
                <div className="d-flex flex-row justify-content-end header">
                    <button type="button" aria-label="Close" onClick={() => {
                        dispatch(setSellerFlag({ data: 0 }));
                    }} className="closeBtn"><AiOutlineCloseCircle size={25} /></button>
                </div>
                <div className="mt-5 mb-5 ps-5 pe-5">
                    <p className="text-center">
                        {t("Do you want to clear cart and add other seller's item??")}
                    </p>
                </div>
                <div className="d-flex justify-content-around mb-5 me-5">
                    <div >
                        <button className="no-btn"
                            onClick={() => dispatch(setSellerFlag({ data: 0 }))}
                        >No
                        </button>
                    </div>
                    <div>
                        <button
                            className="yes-btn"
                            onClick={handleYes}
                        >Yes</button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
});

export default Popup;