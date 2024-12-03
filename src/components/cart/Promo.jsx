import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Loader from '../loader/Loader';
import { Offcanvas } from 'react-bootstrap';
import { setCartPromo } from '../../model/reducer/cartReducer';


function Promo(props) {


    const dispatch = useDispatch();

    const closeCanvas = useRef();

    const cart = useSelector((state) => state.cart);
    const user = useSelector((state) => state.user);
    const setting = useSelector((state) => state.setting);

    const [promo_detail, setPromoDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isapplied, setIsapplied] = useState(false);
    const amount = cart?.cartSubTotal;

    const fetchpromo_codes = async () => {

        await api.getPromo(user?.jwtToken, amount).then(response => response.json())
            .then((result) => {
                // console.log(result);
                if (result.status === 1) {
                    // console.log(result.data);
                    setPromoDetail(result.data);
                }
            });
    };
    const applyPromoCode = async (promo) => {
        setLoading(true);
        await api.setPromo(user?.jwtToken, promo.promo_code, amount).then(response => response.json()).then((result) => {
            setLoading(false);
            if (result.status) {
                dispatch(setCartPromo({ data: result.data }));
                toast.success("Coupon Applied Successfully");
                setIsapplied(true);
                props.setShow(false);
                // dispatch(setPromoCodeApplied({ data: 1 }));
                // console.log(result.data, "resultData")
                // dispatch({ type: ActionTypes.SET_CART_PROMO, payload: result.data });
                // cart.promo_code && (cart.checkout.total_amount =Number(cart.promo_code.discounted_amount));
                // closeCanvas.current?.click();
            }
        });
    };

    useEffect(() => {
        // applyPromoCode();
    }, [amount]);


    useEffect(() => {
        if (props.show) {
            fetchpromo_codes();
        }
    }, [props.show]);

    const { t } = useTranslation();
    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };
    return (
        <>
            <Offcanvas
                show={props.show}
                onHide={() => props.setShow(false)}
                className={`promo-sidebar-container`}
                id="promooffcanvas"
                aria-labelledby="promooffcanvaslabel"
                placement='end'
            >
                <Offcanvas.Header className='promo-sidebar-header'>
                    <span>{t("coupon")}</span>
                    <button type="button" className="close-canvas bg-transparent" onClick={() => props.setShow(false)}><AiOutlineCloseCircle size={26} /></button>
                </Offcanvas.Header>
                <Offcanvas.Body className="promo-sidebar-body">


                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="row-reverse">
                            {promo_detail?.map((promo, index) => {
                                const isAlreadyApplied = cart?.promo_code?.promo_code_id === promo.promo_code_id ? true : false;
                                return (

                                    <div className="col-12 promo-card" key={index}>
                                        <div className="promo-card-e1">
                                            <div className="promo-details">
                                                <div className="promo-img col-4">
                                                    <img src={promo.image_url} onError={placeHolderImage} alt="" />
                                                </div>
                                                <div className="promo-name">
                                                    <span className="promo-code">{promo.promo_code}</span>
                                                    <span className="promo-discount">{promo.promo_code_message}</span>
                                                </div>
                                            </div>
                                            <div className="promo-apply">
                                                {/* {
                                                    isapplied?<span className={`btn ${!promo.is_applicable && 'disabled'}`}
                                                    onClick={() => {
                                                        if (promo.is_applicable) {
                                                            applyPromoCode(promo);
                                                        }
                                                    }}> {t('applied')}</span>:
                                                    <span className={`btn ${!promo.is_applicable && 'disabled'}`}
                                                    onClick={() => {
                                                        if (promo.is_applicable) {
                                                            applyPromoCode(promo);
                                                        }
                                                    }}>{t('apply')}</span>
                                                } */}
                                                <span
                                                    className={`btn ${!promo.is_applicable && 'disabled'} ${!isAlreadyApplied && 'applied'}`}
                                                    onClick={() => {
                                                        if (promo.is_applicable && !isAlreadyApplied) {
                                                            applyPromoCode(promo);
                                                            // Update the applied state for the current promo code
                                                            promo_detail[index].is_applied = true;
                                                            // props.setShow(false);
                                                            const updatedPromoDetail = promo_detail.map((item) =>
                                                                item.promo_code_id === promo.promo_code_id
                                                                    ? { ...item, is_applied: true }
                                                                    : { ...item, is_applied: false });
                                                            setPromoDetail(updatedPromoDetail);
                                                        }
                                                    }}
                                                >
                                                    {isAlreadyApplied && promo.is_applicable ? t('applied') : t('apply')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="promo-card-e2">
                                            {promo.is_applicable ?
                                                <span className="promo-description">{`${t("you_will_save")} ${setting.setting && setting.setting.currency} ${promo.discount} ${t("on_this_coupon")}`}</span>
                                                :
                                                <span className="promo-description">{t("not_applicable")}</span>
                                            }
                                        </div>
                                    </div>
                                );
                            })
                            }
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>


        </>
    );
}

export default Promo;
