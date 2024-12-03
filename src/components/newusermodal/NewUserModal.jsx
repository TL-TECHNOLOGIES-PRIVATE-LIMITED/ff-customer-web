import React, { useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import * as newApi from "../../api/apiCollection"
import { toast } from 'react-toastify';
import '../login/login.css';
import './newmodal.css';
import { useTranslation } from 'react-i18next';
import { setCurrentUser, setJWTToken } from "../../model/reducer/authReducer";
import { setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import { addtoGuestCart, setCart, setCartProducts, setCartSubTotal, setGuestCartTotal, setIsGuest } from '../../model/reducer/cartReducer';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { setSetting } from '../../model/reducer/settingReducer';
import { setTokenThunk } from '../../model/thunk/loginThunk';


function NewUserModal({ registerModalShow, setRegisterModalShow, phoneNum, setPhoneNum, countryCode, userEmail, setUserEmail, userName, setUserName, setLoginModal, setIsOTP, userAuthType, phoneNumberWithoutCountryCode, setPhoneNumberWithoutCountryCode }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const user = useSelector((state) => state.user);
    const setting = useSelector((state) => state.setting);
    const cart = useSelector((state) => state.cart);
    const fcm_token = useSelector((state) => state.user.fcm_token)
    const auth_id = useSelector((state) => state.user.authId)
    const city = useSelector(state => state.city);
    // const [username, setusername] = useState();
    // const [useremail, setuseremail] = useState();
    const [isLoading, setisLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");

    const closeModalRef = useRef();

    const handleFetchSetting = async () => {
        const setting = await newApi.getSetting()
        dispatch(setSetting({ data: setting?.data }));
        dispatch(setFavouriteLength({ data: setting?.data?.favorite_product_ids?.length }));
        dispatch(setFavouriteProductIds({ data: setting?.data?.favorite_product_ids }));
    }

    const fetchCart = async (latitude, longitude) => {
        try {
            const response = await newApi.getCart({ latitude: latitude, longitude: longitude })
            if (response.status === 1) {
                dispatch(setCart({ data: response.data }))
                const productsData = getProductData(response.data)
                dispatch(setCartProducts({ data: productsData }));
                dispatch(setCartSubTotal({ data: response?.data?.sub_total }))
            } else {
                dispatch(setCart({ data: null }));
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    const getProductData = (cartData) => {
        const cartProducts = cartData?.cart?.map((product) => {
            return {
                product_id: product?.product_id,
                product_variant_id: product?.product_variant_id,
                qty: product?.qty
            }
        })
        return cartProducts;
    }



    const handleUserRegistration = async (e) => {
        let latitude;
        let longitude;
        e.preventDefault();
        try {
            if (phoneNumberWithoutCountryCode?.length < countryCode?.length || phoneNumberWithoutCountryCode == null) {
                setError(t("please_enter_phone_number"))
                setisLoading(false)
            } else {


                const res = await newApi.registerUser({ id: userEmail, name: userName, email: userEmail, mobile: phoneNumberWithoutCountryCode, type: userAuthType, fcm: fcm_token, country_code: countryCode })

                const tokenSet = await dispatch(setTokenThunk(res?.data?.access_token))
                await getCurrentUser()
                await handleFetchSetting()
                latitude = city?.city?.latitude || setting?.setting?.default_city?.latitude
                longitude = city?.city?.longitude || setting?.setting?.default_city?.longitude
                if (res.data?.user?.status == 1) {
                    dispatch(setIsGuest({ data: false }));
                }
                if (cart?.isGuest === true && cart?.guestCart?.length !== 0 && res?.data?.user?.status == 1) {
                    await AddtoCartBulk(res?.data.access_token);
                }
                await fetchCart(latitude, longitude);
                setRegisterModalShow(false);
                toast.success(t("register_successfully"));
                setLoginModal(false)
                setIsOTP(false)
            }
        } catch (error) {
            console.log("error", error)
            setError("error.occured")
        }
    }

    const AddtoCartBulk = async (token) => {
        try {
            const variantIds = cart?.guestCart?.map((p) => p.product_variant_id);
            const quantities = cart?.guestCart?.map((p) => p.qty);
            const response = await api.bulkAddToCart(token, variantIds.join(","), quantities.join(","));
            const result = await response.json();
            if (result.status == 1) {
                dispatch(setGuestCartTotal({ data: 0 }));
                dispatch(addtoGuestCart({ data: [] }))
            } else {
                console.log("Add to Bulk Cart Error Occurred");
            }
        } catch (e) {
            console.log(e?.message);
        }
    };

    const getCurrentUser = async () => {
        try {
            const response = await newApi.getUser()
            dispatch(setCurrentUser({ data: response.user }));
        } catch (error) {
            console.log("error", error)
        }
    };



    return (
        <Modal
            // show={user.user && user.user.status == 2}
            show={registerModalShow}
            backdrop="static"
            keyboard={true}
            size='md'
            centered
            className='user_data_modal'>
            <Modal.Header className='web_logo'>
                <img src={setting.setting && setting.setting.web_settings.web_logo} alt="" />
                <AiOutlineCloseCircle className='cursorPointer' size={20} onClick={() => {
                    setRegisterModalShow(false);
                    // setusername();
                    // setuseremail();
                }} />
            </Modal.Header>
            <Modal.Body
                className='user_data_modal_body'>
                <span className='note'>{t("profile_note")}</span>
                {error !== "" && (<span className='error-msg'>{error}</span>)}
                <form onSubmit={handleUserRegistration} className='userData-Form'>
                    <div className='inputs-container'>
                        <input type='text' placeholder={t('user_name')} value={userName} onChange={(e) => {
                            setError("");
                            setUserName(e.target.value);
                        }} required
                            className={userAuthType == "google" ? "inactive-input" : "active-input"}
                            disabled={userAuthType == "google"}
                        />
                        <input type='email' placeholder={t('email_address')} disabled={userAuthType == "google"} value={userEmail} onChange={(e) => {
                            setError("");
                            setUserEmail(e.target.value);
                        }}
                            required
                            className={userAuthType == "google" ? "inactive-input" : "active-input"}
                        />
                        <input type='tel' placeholder={t('mobile_number')} disabled={userAuthType == "phone"} value={phoneNumberWithoutCountryCode} onChange={(e) => setPhoneNumberWithoutCountryCode(e.target.value)}
                            className={userAuthType == "phone" ? "inactive-input" : "active-input"}
                        />
                    </div>
                    <button type='submit' disabled={isLoading} >{t("register")} {t("profile")}</button>
                </form>
                {error && (<p className='user_data_form_error'>{error}</p>)}
            </Modal.Body>
        </Modal>
    );
}

export default NewUserModal;
