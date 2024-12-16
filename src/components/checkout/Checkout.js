import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Calendar } from 'react-calendar';
import coverImg from '../../utils/cover-img.jpg';
import Address from '../address/Address';
import './checkout.css';
import 'react-calendar/dist/Calendar.css';
import api from '../../api/api';
import rozerpay from '../../utils/ic_razorpay.svg';
// import cashfree from '../../utils/ic_cashfree-2.svg';
import cashfree from '../../utils/ic_cashfree.svg';
import paystack from '../../utils/ic_paystack.svg';
import paytabs from '../../utils/Icons/ic_paytabs.svg';
import Stripe from '../../utils/Checkout_stripe.svg';
import cod from '../../utils/ic_cod.svg';
import { useDispatch, useSelector } from 'react-redux';
import paypal from "../../utils/ic_paypal.svg";
import Midtrans from "../../utils/Icons/Midtrans.svg";
import PhonepeSVG from "../../utils/Icons/Phonepe.svg";
import { toast } from 'react-toastify';
import { Link, Router, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Modal from 'react-bootstrap/Modal';
// import { Modal } from 'antd';

//lottie animation JSONs
import Lottie from 'lottie-react';
import animate1 from '../../utils/order_placed_back_animation.json';
import animate2 from '../../utils/order_success_tick_animation.json';

//payment methods
import { useRazorpay } from 'react-razorpay';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
} from '@stripe/react-stripe-js';
// import CheckoutForm from './CheckoutForm'
import InjectCheckout from './StripeModal';
import PaystackPop from '@paystack/inline-js';
import Loader from '../loader/Loader';
import Promo from '../cart/Promo';
import { useTranslation } from 'react-i18next';
import { setCart, setCartCheckout, setCartProducts, setCartPromo, setCartSubTotal, setWallet } from '../../model/reducer/cartReducer';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { PiWallet } from "react-icons/pi";
import { deductUserBalance } from '../../model/reducer/authReducer';
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';
import { formatDate } from '../../utils/formatDate';
import { setPromoCode } from '../../model/reducer/promoReducer';
import { IoIosWarning } from "react-icons/io";
import Location from '../location/Location';


const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const city = useSelector(state => state.city);
    const cart = useSelector(state => (state.cart));
    const address = useSelector((state) => state.address);
    const user = useSelector(state => (state.user));
    const setting = useSelector(state => (state.setting));
    const promoCode = useSelector(state => state.promoCode);

    const [paymentUrl, setpaymentUrl] = useState(null);
    const [codAllow, setCodAllow] = useState(0);
    const [totalPayment, setTotalPayment] = useState(null);
    const [walletDeductionAmt, setWalletDeductionAmt] = useState(null);
    const [order, setOrder] = useState(false);
    const [walletAmount, setWalletAmount] = useState(user?.user?.balance);
    const [isPromoApplied, setIsPromoApplied] = useState(false);
    const [IsOrderPlaced, setIsOrderPlaced] = useState(false);
    const [expectedDate, setexpectedDate] = useState(null);
    const [timeslots, settimeslots] = useState(null);
    const [selectedAddress, setselectedAddress] = useState(null);
    const today = new Date();
    const [expectedTime, setexpectedTime] = useState();
    const [paymentMethod, setpaymentMethod] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [orderID, setOrderID] = useState(0);
    const [loadingPlaceOrder, setloadingPlaceOrder] = useState(false);
    const [stripeOrderId, setstripeOrderId] = useState(null);
    const [stripeClientSecret, setstripeClientSecret] = useState(null);
    const [stripeTransactionId, setstripeTransactionId] = useState(null);
    const [show, setShow] = useState(false);
    const [showPromoOffcanvas, setShowPromoOffcanvas] = useState(false);
    const [stripeModalShow, setStripeModalShow] = useState(false);
    const [isFullWalletPay, setIsFullWalletPay] = useState(false);
    const [isLoader, setisLoader] = useState(false);
    const paypalStatus = useRef(false);
    const [isNetworkError, setIsNetworkError] = useState(false);
    const [orderNote, setOrderNote] = useState("");
    const [cartError, setCartError] = useState("")
    const [locModal, setLocModal] = useState(false);
    const [bodyScroll, setBodyScroll] = useState(false)
    const [deliveryCharge, setDeliveryCharge] = useState(null)


    const stripePromise = loadStripe(setting?.payment_setting && setting?.payment_setting?.stripe_publishable_key);
    useEffect(() => {
        fetchCart();
        let latitude;
        let longitude;
        const currentDate = new Date();
        setexpectedDate(currentDate);
        if (address.address !== null) {
            latitude = address.selected_address.latitude
            longitude = address.selected_address.longitude
        } else {
            latitude = city.city.latitude
            longitude = city.city.longitude
        }
        api.getCartSeller(user?.jwtToken, latitude, longitude, 1)
            .then(res => res.json())
            .then(result => {
                setCodAllow(result?.data?.cod_allowed);
                // setpaymentMethod("COD");
            })
            .catch(error => console.log(error));
        fetchTimeSlot();
    }, []);

    useEffect(() => {
        fetchCart();
    }, [locModal])

    const fetchCart = async () => {
        let latitude;
        let longitude;

        if (address.address !== null) {
            latitude = address.selected_address.latitude
            longitude = address.selected_address.longitude
        } else {
            latitude = city.city.latitude
            longitude = city.city.longitude
        }
        api.getCart(user?.jwtToken, latitude, longitude, 1)
            .then(response => response.json())
            .then(result => {

                if (result.status === 1) {
                    dispatch(setCartCheckout({ data: result.data }));
                    dispatch(setWallet({ data: 0 }));

                    if (promoCode?.isPromoCode === true) {
                        setTotalPayment(result.data.total_amount - promoCode?.discount);
                    }
                    else if (cart?.promo_code) {
                        dispatch(setPromoCode({
                            code: cart.promo_code,
                            discount: cart.promo_code.discount,
                            isPromoCode: true
                        }));
                        setTotalPayment(result.data.total_amount - cart?.promo_code?.discount);
                    } else {
                        setTotalPayment(result.data.total_amount);
                    }
                    setWalletAmount(user?.user?.balance);
                    setCartError("")
                } else if (result.status === 0) {
                    setCartError(result?.message)
                }
            })
            .catch(error => {
                const isNoInternet = ValidateNoInternet(error);
                if (isNoInternet) {
                    setIsNetworkError(isNoInternet);
                };
            });
    }

    useEffect(() => {
        if (address?.selected_address?.latitude && address?.selected_address?.longitude)
            api.getCart(user?.jwtToken, address?.selected_address?.latitude, address?.selected_address?.longitude, 1)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        setCodAllow(result?.data?.cod_allowed);
                        dispatch(setCartCheckout({ data: result.data }));
                        setDeliveryCharge(result?.data?.delivery_charge?.total_delivery_charge)
                        dispatch(setWallet({ data: 0 }));
                        if (promoCode?.isPromoCode === true) {
                            setTotalPayment(result.data.total_amount - promoCode?.discount);
                        } else if (cart?.promo_code) {
                            dispatch(setPromoCode({
                                code: cart.promo_code,
                                discount: cart.promo_code.discount,
                                isPromoCode: true
                            }));
                            setTotalPayment(result.data.total_amount - cart?.promo_code?.discount);
                        }
                        else {
                            setTotalPayment(result.data.total_amount);
                        }
                        setCartError("")
                    } else if (result.status === 0) {
                        setCartError(result?.message)
                        const updatedTotalPayment = totalPayment - deliveryCharge;
                        setTotalPayment(updatedTotalPayment)
                        setDeliveryCharge(0)
                    }

                })
                .catch(error => console.log(error));
    }, [address?.selected_address, promoCode]);
    const fetchTimeSlot = () => {
        api.fetchTimeSlot()
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    if (result?.data?.time_slots_is_enabled == "false") {
                        // toast.error(t("timeslots_not_enabled"));
                    }
                    settimeslots(result.data);
                    setexpectedTime(result?.data?.time_slots.filter((element) => checkLastOrderTime(element?.last_order_time))[0]);
                }
            })
            .catch(error => console.log(error));

    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0'); // Pad day with 0 if needed
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Pad month with 0 if needed
        const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
        return `${day}-${month}-${year}`;
    };


    const checkLastOrderTime = (lastTime) => {
        const currentTime = expectedDate == "Invalid Date" ? new Date() : expectedDate;
        if (currentTime > new Date()) {
            return true;
        }
        const hours = lastTime.split(':')[0];
        const minutes = lastTime.split(':')[1];
        const seconds = lastTime.split(':')[2];
        const lastOrderTime = new Date();
        lastOrderTime.setHours(hours);
        lastOrderTime.setMinutes(minutes);
        lastOrderTime.setSeconds(seconds);
        return currentTime <= lastOrderTime;
    };


    // Filter the time slots based on last_order_time
    useEffect(() => {
        const currentDateTime = new Date();
        setexpectedDate(new Date(currentDateTime.setDate(currentDateTime.getDate())));
    }, [timeslots]);

    useEffect(() => {
        setexpectedTime(timeslots?.time_slots.filter((element) => checkLastOrderTime(element?.last_order_time))[0]);
    }, [expectedDate]);


    const handleModal = () => {
        setLocModal(true);
        setBodyScroll(true);
    };

    const initializeRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            // document.body.appendChild(script);
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };

            document.body.appendChild(script);
        });
    };
    const { Razorpay } = useRazorpay();
    const handleRozarpayPayment = useCallback(async (order_id, razorpay_transaction_id, amount, name, email, mobile, app_name) => {
        const res = await initializeRazorpay();
        if (!res) {
            console.error("RazorPay SDK Load Failed");
            return;
        }
        const key = setting.payment_setting && setting.payment_setting.razorpay_key;
        const convertedAmount = Math.floor(amount * 100);

        const options = {
            key: key,
            amount: convertedAmount,
            currency: "INR",
            name: name,
            description: app_name,
            image: setting.setting && setting.setting.web_settings.web_logo,
            order_id: razorpay_transaction_id,
            handler: async (res) => {
                if (res.razorpay_payment_id) {
                    // setloadingPlaceOrder(true);
                    await api.addRazorpayTransaction(user?.jwtToken, order_id, res.razorpay_payment_id, res.razorpay_order_id, res.razorpay_payment_id, res.razorpay_signature)
                        .then(response => response.json())
                        .then(result => {
                            // setloadingPlaceOrder(false);
                            if (result.status === 1) {
                                toast.success(result.message);
                                setIsOrderPlaced(true);
                                setShow(true);
                                dispatch(setCartProducts({ data: [] }));
                                dispatch(setCartSubTotal({ data: 0 }));
                            }
                            else {
                                toast.error(result.message);
                            }
                        })
                        .catch(error => {
                            // rzpay.close()
                            console.log(error)
                        })
                }
            },
            modal: {
                confirm_close: true,
                ondismiss: async (reason) => {
                    if (reason === undefined) {
                        handleRazorpayCancel(order_id);
                        dispatch(deductUserBalance({ data: walletDeductionAmt ? walletDeductionAmt : 0 }));
                    }
                }
            },
            prefill: {
                name: name,
                email: email,
                contact: mobile,
            },
            notes: {
                address: "Razorpay Corporate ",
            },
            theme: {
                color: setting.setting && setting.setting.web_settings.color,
            },
        };

        const rzpay = new window.Razorpay(options);

        rzpay.on('payment.cancel', function (response) {
            alert("Payment Cancelled");
            handleRazorpayCancel(order_id);
        });
        rzpay.on('payment.failed', function (response) {
            api.deleteOrder(user?.jwtToken, order_id);
        });

        rzpay.open();

    }, [Razorpay]);

    const handleRazorpayCancel = (order_id) => {
        api.deleteOrder(user?.jwtToken, order_id);
        setWalletDeductionAmt(walletDeductionAmt);
        setWalletAmount(user.user.balance);
        // setTotalPayment(totalPayment);
        setIsOrderPlaced(false);
    };

    const handlePayStackPayment = (email, amount, currency, support_email, orderid) => {
        let handler = PaystackPop.setup({
            key: setting.payment_setting && setting.payment_setting.paystack_public_key,
            email: email,
            amount: parseFloat(amount) * 100,
            currency: currency,
            ref: (new Date()).getTime().toString(),
            label: support_email,
            onClose: function () {
                api.deleteOrder(user?.jwtToken, orderid);
                setWalletAmount(user.user.balance);
                dispatch(setWallet({ data: 0 }));
            },
            callback: async function (response) {
                setloadingPlaceOrder(true);
                await api.addTransaction(user?.jwtToken, orderid, response.reference, paymentMethod, "order")
                    .then(response => response.json())
                    .then(result => {
                        setloadingPlaceOrder(false);
                        if (result.status === 1) {
                            toast.success(result.message);
                            setIsOrderPlaced(true);
                            setShow(true);
                            dispatch(setCartProducts({ data: [] }));
                            dispatch(setCartSubTotal({ data: 0 }));
                        }
                        else {
                            toast.error(result.message);
                            console.log(result)
                        }
                    })
                    .catch(error => console.log(error));

            }
        });

        handler.openIframe();
    };

    useEffect(() => {
        if (cart?.is_wallet_checked && totalPayment > walletAmount) {
            setWalletDeductionAmt(walletAmount);
            setWalletAmount(0);
            setTotalPayment(totalPayment - walletAmount);
            setIsFullWalletPay(false);
        } else if (cart?.is_wallet_checked && totalPayment <= walletAmount) {
            const remainingwalletBalance = walletAmount - totalPayment;
            setWalletDeductionAmt(totalPayment);
            setWalletAmount(remainingwalletBalance);
            setTotalPayment(0);
            setIsFullWalletPay(true);
            setpaymentMethod("Wallet");
        } else if (!cart?.is_wallet_checked && cart?.promo_code) {
            setTotalPayment(cart?.checkout?.total_amount - cart?.promo_code?.discount);
            setWalletAmount(user.user.balance);
            setWalletDeductionAmt(0);
            setIsFullWalletPay(false);
        } else {
            setTotalPayment(cart?.checkout?.total_amount);
            setWalletAmount(user.user.balance);
            setWalletDeductionAmt(0);
            setIsFullWalletPay(false);
        }
    }, [cart?.is_wallet_checked]);

    const HandlePlaceOrder = async (e) => {
        // e.preventDefault();
        //place order
        if (!expectedDate) {
            toast.error(t('please_select_date'));
        }
        else if (!address.address) {
            toast.error(t("please_select_address"));
            // toast.error(t("something_went_wrong_select_address"));
        }
        else if (address.selected_address === null) {
            toast.error("Please Select a Default Delivery Address");
        }
        else {
            setDeliveryTime(`${expectedDate.getDate()}-${expectedDate.getMonth() + 1}-${expectedDate.getFullYear()} ${expectedTime?.title}`);
            const delivery_time = `${expectedDate.getDate()}-${expectedDate.getMonth() + 1}-${expectedDate.getFullYear()} ${expectedTime?.title}`;

            setloadingPlaceOrder(true);
            if (paymentMethod === "") {
                toast.error(t("please_select_payment_method"));
                setloadingPlaceOrder(false);
                return;
            }
            if (delivery_time === null) {
                toast.error("Please Select Preferred Delivery Time");
                setloadingPlaceOrder(false);
                return;
            } else if (paymentMethod === 'COD') {
                // place order
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote)
                    .then(response => response.json())
                    .then(async (result) => {
                        setisLoader(false);
                        if (result.status === 1) {
                            setOrderNote("");
                            toast.success("Order Successfully Placed!");
                            setloadingPlaceOrder(false);
                            dispatch(setWallet({ data: 0 }));
                            dispatch(setCartPromo({ data: null }));
                            dispatch(setCartProducts({ data: [] }));
                            dispatch(setCartSubTotal({ data: 0 }));
                            dispatch(deductUserBalance({ data: walletDeductionAmt }));
                            setIsOrderPlaced(true);
                            setShow(true);

                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                            setOrderNote("");
                        }
                        dispatch(setPromoCode({
                            code: null,
                            discount: 0,
                            isPromoCode: false
                        }));
                    })
                    .catch(error => {
                        setisLoader(false);
                        setloadingPlaceOrder(false);
                        console.log(error);
                    });
            } else if (paymentMethod === 'Razorpay') {
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote)
                    .then(response => response.json())
                    .then(async result => {
                        // fetchOrders();
                        if (result.status === 1) {
                            setOrderNote("");
                            await api.initiate_transaction(user?.jwtToken, result.data.order_id, "Razorpay", "order")
                                .then(resp => resp.json())
                                .then(res => {
                                    setisLoader(false);
                                    if (res.status === 1) {
                                        setloadingPlaceOrder(false);
                                        dispatch(setCartPromo({ data: null }));
                                        handleRozarpayPayment(result.data.order_id, res.data.transaction_id, cart.promo_code ? (cart.promo_code.discounted_amount + cart.checkout.delivery_charge.total_delivery_charge) : cart.checkout.total_amount, user.user.name, user.user.email, user.user.mobile, setting.setting?.app_name, walletDeductionAmt);
                                    }
                                    else {
                                        api.deleteOrder(user?.jwtToken, result.data.order_id);
                                        toast.error(res.message);
                                        setloadingPlaceOrder(false);
                                        setWalletAmount(walletDeductionAmt);
                                    }
                                    dispatch(setPromoCode({
                                        code: null,
                                        discount: 0,
                                        isPromoCode: false
                                    }));
                                })
                                .catch(error => {

                                    console.error(error);
                                });

                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                            setOrderNote("");
                        }
                    })
                    .catch(error => console.log(error));
            } else if (paymentMethod === "Cashfree") {
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote).then((res) => res.json()).then(async (result) => {
                    if (result.status === 1) {
                        setOrderNote("");
                        dispatch(setCartPromo({ data: null }));
                        setloadingPlaceOrder(false);
                        setOrderID(result.data.order_id);
                        await api.initiate_transaction(user?.jwtToken, result?.data?.order_id, "Cashfree", "order").then((res) => res.json()).then((res) => {
                            if (res?.status === 1) {
                                setisLoader(false);
                                setloadingPlaceOrder(false);
                                setpaymentUrl(res.data?.redirectUrl);
                                dispatch(deductUserBalance({ data: walletDeductionAmt }));
                                dispatch(setCartPromo({ data: null }));
                                let subWindow = window.open(res.data?.redirectUrl, '_parent');
                            } else {
                                toast.error(res.message);
                                setloadingPlaceOrder(false);
                                api.deleteOrder(user?.jwtToken, result.data.order_id);
                            }
                            dispatch(setPromoCode({
                                code: null,
                                discount: 0,
                                isPromoCode: false
                            }));
                        }).catch((err) => {
                            toast.error(err.message);
                            setisLoader(false);
                            setloadingPlaceOrder(false);
                        })
                    } else {
                        toast.error(result.message);
                        setloadingPlaceOrder(false);
                        setOrderNote("");
                    }
                })
            } else if (paymentMethod === 'Paystack') {
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote)
                    .then(response => response.json())
                    .then(result => {
                        // fetchOrders();
                        if (result.status === 1) {
                            setOrderNote("");
                            // dispatch(deductUserBalance({ data: walletDeductionAmt }));
                            dispatch(setCartPromo({ data: null }));
                            setloadingPlaceOrder(false);
                            setOrderID(result.data.order_id);
                            handlePayStackPayment(user.user.email, totalPayment, setting.payment_setting.paystack_currency_code, setting.setting.support_email, result.data.order_id);

                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                            setOrderNote("");
                            api.deleteOrder(user?.jwtToken, result.data.order_id);
                        }
                        dispatch(setPromoCode({
                            code: null,
                            discount: 0,
                            isPromoCode: false
                        }));
                    })
                    .catch(error => console.log(error));

            } else if (paymentMethod === "Stripe") {
                setStripeModalShow(true);
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote)
                    .then(response => response.json())
                    .then(async result => {
                        if (result.status === 1) {
                            setOrderNote("");
                            await api.initiate_transaction(user?.jwtToken, result.data.order_id, 'Stripe', "order")
                                .then(resp => resp.json())
                                .then(res => {
                                    if (res.status === 1) {
                                        // dispatch(deductUserBalance({ data: walletDeductionAmt }));
                                        dispatch(setCartPromo({ data: null }));
                                        setstripeOrderId(result.data.order_id);
                                        setstripeClientSecret(res.data.client_secret);
                                        setstripeTransactionId(res.data.id);
                                    } else {
                                        setIsOrderPlaced(false);
                                        api.deleteOrder(user?.jwtToken, result.data.order_id);

                                    }
                                    setloadingPlaceOrder(false);
                                })
                                .catch(error => console.log(error));
                            // fetchOrders();
                        }
                        else {
                            setStripeModalShow(false);
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                            setOrderNote("");
                        }
                        dispatch(setPromoCode({
                            code: null,
                            discount: 0,
                            isPromoCode: false
                        }));
                    })
                    .catch(error => console.log(error));
                setloadingPlaceOrder(false);
            } else if (paymentMethod === 'Paypal') {
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote)
                    .then(response => response.json())
                    .then(async result => {
                        // fetchOrders();
                        if (result.status === 1) {
                            setOrderNote("");
                            setOrderID(result.data.order_id);
                            await api.initiate_transaction(user?.jwtToken, result.data.order_id, "Paypal", "order")
                                .then(resp => resp.json())
                                .then(res => {

                                    // console.log(res.data.paypal_redirect_url)
                                    setisLoader(false);

                                    if (res.status === 1) {
                                        setloadingPlaceOrder(false);
                                        setpaymentUrl(res.data.paypal_redirect_url);
                                        dispatch(deductUserBalance({ data: walletDeductionAmt }));
                                        dispatch(setCartPromo({ data: null }));
                                        let ccavenue_redirect_url = `${res.data.paypal_redirect_url}&&amount=${totalPayment}`;
                                        let subWindow = window.open(ccavenue_redirect_url, '_parent');
                                    } else {
                                        toast.error(res.message);
                                        setloadingPlaceOrder(false);
                                        api.deleteOrder(user?.jwtToken, result.data.order_id);
                                    }
                                    dispatch(setPromoCode({
                                        code: null,
                                        discount: 0,
                                        isPromoCode: false
                                    }));
                                })
                                .catch(error => console.error(error));

                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                            setisLoader(false);
                            setOrderNote("");
                        }
                    })
                    .catch(error => console.log(error));
            } else if (paymentMethod === 'Wallet') {
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote)
                    .then(response => response.json())
                    .then(async (result) => {
                        setisLoader(false);
                        if (result.status === 1) {
                            setOrderNote("");
                            toast.success("Order Successfully Placed!");
                            setloadingPlaceOrder(false);
                            dispatch(setWallet({ data: 0 }));
                            dispatch(setCartPromo({ data: null }));
                            dispatch(deductUserBalance({ data: walletDeductionAmt }));
                            setIsOrderPlaced(true);
                            setShow(true);
                            dispatch(setCartProducts({ data: [] }));
                            dispatch(setCartSubTotal({ data: 0 }));
                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                            setOrderNote("");
                            api.deleteOrder(user?.jwtToken, result.data.order_id);
                        }
                        dispatch(setPromoCode({
                            code: null,
                            discount: 0,
                            isPromoCode: false
                        }));
                    })
                    .catch(error => {
                        setisLoader(false);
                        setloadingPlaceOrder(false);
                        console.log(error);
                    });

                // else if (paymentMethod === "Paytm") {
                //      await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, cart.promo_code ? cart.promo_code.discounted_amount: cart.checkout.total_amount, paymentMethod, address.selected_address.id, delivery_time)
                //         .then(response => response.json())
                //         .then(async result => {
                //             if (result.status === 1) {

                //             }

                //         })
                //         .catch(error => console.error(error))
                // }

            } else if (paymentMethod == "Midtrans") {
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote)
                    .then(response => response.json())
                    .then(async result => {
                        // fetchOrders();
                        if (result.status === 1) {
                            setOrderNote("");
                            setOrderID(result.data.order_id);
                            await api.initiate_transaction(user?.jwtToken, result.data.order_id, "Midtrans", "order")
                                .then(resp => resp.json())
                                .then(res => {
                                    setisLoader(false);
                                    if (res.status === 1) {
                                        setloadingPlaceOrder(false);
                                        setpaymentUrl(res.data.midtrans_redirect_url?.snapUrl);
                                        dispatch(deductUserBalance({ data: walletDeductionAmt }));
                                        dispatch(setCartPromo({ data: null }));
                                        let subWindow = window.open(res.data?.snapUrl, '_parent');
                                    } else {
                                        toast.error(res.message);
                                        setloadingPlaceOrder(false);
                                        api.deleteOrder(user?.jwtToken, result.data.order_id);
                                    }
                                })
                                .catch(error => console.error(error));
                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                            setisLoader(false);
                            setOrderNote("");
                        }
                        dispatch(setPromoCode({
                            code: null,
                            discount: 0,
                            isPromoCode: false
                        }));
                    })
                    .catch(error => console.log(error));
            } else if (paymentMethod == "Phonepe") {
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote)
                    .then(response => response.json())
                    .then(async result => {
                        // fetchOrders();
                        if (result.status === 1) {
                            setOrderNote("");
                            setOrderID(result.data.order_id);
                            await api.initiate_transaction(user?.jwtToken, result.data.order_id, "Phonepe", "order")
                                .then(resp => resp.json())
                                .then(res => {
                                    setisLoader(false);
                                    if (res.status === 1) {
                                        setloadingPlaceOrder(false);
                                        setpaymentUrl(res.data.redirectUrl);
                                        dispatch(deductUserBalance({ data: walletDeductionAmt }));
                                        dispatch(setCartPromo({ data: null }));
                                        window.open(res.data?.redirectUrl, '_parent');
                                    } else {
                                        toast.error(res.message);
                                        setloadingPlaceOrder(false);
                                        api.deleteOrder(user?.jwtToken, result.data.order_id);
                                    }
                                    dispatch(setPromoCode({
                                        code: null,
                                        discount: 0,
                                        isPromoCode: false
                                    }));
                                })
                                .catch(error => console.error(error));
                        }
                        else {
                            toast.error(result.message);
                            setloadingPlaceOrder(false);
                            setisLoader(false);
                            setOrderNote("");
                        }
                    })
                    .catch(error => console.log(error));
            } else if (paymentMethod == "Paytabs") {
                await api.placeOrder(user?.jwtToken, cart.checkout.product_variant_id, cart.checkout.quantity, cart.checkout.sub_total, cart.checkout.delivery_charge.total_delivery_charge, totalPayment, paymentMethod, address.selected_address.id, delivery_time, cart.promo_code?.promo_code_id, cart.is_wallet_checked ? (walletDeductionAmt) : null, cart.is_wallet_checked ? 1 : 0, orderNote).then((res) => res.json()).then(async (result) => {
                    if (result.status === 1) {
                        setOrderNote("");
                        dispatch(setCartPromo({ data: null }));
                        setloadingPlaceOrder(false);
                        setOrderID(result.data.order_id);
                        await api.initiate_transaction(user?.jwtToken, result?.data?.order_id, "Paytabs", "order").then((res) => res.json()).then((res) => {
                            if (res?.status === 1) {
                                setisLoader(false);
                                setloadingPlaceOrder(false);
                                setpaymentUrl(res.data?.redirectUrl);
                                dispatch(deductUserBalance({ data: walletDeductionAmt }));
                                dispatch(setCartPromo({ data: null }));
                                let subWindow = window.open(res?.data?.redirectUrl, '_parent');
                            } else {
                                toast.error(res.message);
                                setloadingPlaceOrder(false);
                                api.deleteOrder(user?.jwtToken, result.data.order_id);
                            }
                            dispatch(setPromoCode({
                                code: null,
                                discount: 0,
                                isPromoCode: false
                            }));
                        }).catch((err) => {
                            toast.error(err.message);
                            setisLoader(false);
                            setloadingPlaceOrder(false);
                        })
                    } else {
                        toast.error(result.message);
                        setloadingPlaceOrder(false);
                        setOrderNote("");
                    }
                })
            }
        }
    };
    const handleClose = () => {
        setisLoader(true);
        api.removeCart(user?.jwtToken).then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    dispatch(setCart({ data: null }));
                    dispatch(setCartCheckout({ data: null }));
                }
            });
        setShow(false);
        paypalStatus.current = false;
        navigate('/');
    };


    useEffect(() => {
        if (IsOrderPlaced) {
            setShow(true);
            setTimeout(async () => {
                handleClose();
            }, 5000);
        }
    }, [IsOrderPlaced]);

    const { t } = useTranslation();

    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };
    const getEstimatedDeliveryDate = () => {
        const daysToAdd = parseInt(setting?.setting?.web_settings?.delivery_estimate_days) || 0;

        // Create a new date object for the current date
        const currentDate = new Date();

        // Add the specified number of days
        const deliveryDate = new Date(currentDate.setDate(currentDate.getDate() + daysToAdd));
        return formatDate(deliveryDate);
    };
    const current = new Date();
    return (
        <>
            {!isNetworkError ?
                <>
                    <section id='checkout'>
                        {IsOrderPlaced ?
                            <>
                                <Modal
                                    show={show}
                                    onHide={handleClose}
                                    backdrop="static"
                                    keyboard={true}
                                    className='success_modal'
                                    dialogClassName='successModalDialog'>
                                    <Lottie className='lottie-content' animationData={animate1} loop={true}></Lottie>
                                    <Modal.Header closeButton className='flex-column-reverse success_header'>
                                        <Modal.Title>
                                            <Lottie animationData={animate2} loop={false} className='lottie-tick'></Lottie>
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body className='success_body d-flex flex-column justify-content-center align-items-center'>
                                        <div>
                                            <p className='order-success-desc'>{t("order_placed_description")}</p>
                                        </div>
                                        <button onClick={handleClose} className='checkout_btn'>
                                            {t("go_to_home")}
                                        </button>
                                    </Modal.Body>
                                    {/* <Modal.Footer className="success_footer">

                            </Modal.Footer> */}
                                </Modal>
                            </>
                            : null}

                        <div className='cover'>
                            <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                            <div className='title'>
                                <h3>{t("checkout")}</h3>
                                <span><Link to="/" className="text-white text-decoration-none">{t("home")} / </Link> </span><span className='active'>{t("checkout")}</span>
                            </div>
                        </div>


                        {!setting.payment_setting === null && !expectedTime === null
                            ? (
                                <Loader screen='full' />
                            )
                            : (
                                <>
                                    <div className='checkout-container container'>

                                        <div className='checkout-util-container col-lg-9'>
                                            <div className='billibg-address-wrapper checkout-component'>
                                                <span className='heading'>{t("billing_details")}</span>

                                                <Address setselectedAddress={setselectedAddress} selectedAddress={selectedAddress} />
                                            </div>
                                            {timeslots && timeslots.time_slots_is_enabled === "true" ?
                                                <>

                                                    <div className='delivery-day-wrapper checkout-component'>
                                                        <span className='heading'>{t("prefered_day")}</span>
                                                        <div className='d-flex justify-content-center p-3 calendarContainer'>


                                                            <Calendar
                                                                value={expectedDate.toString() === "Invalid Date" ? new Date() : expectedDate}
                                                                onChange={(e) => {
                                                                    if (new Date(e) >= new Date()) {
                                                                        setexpectedDate(new Date(e));
                                                                    }
                                                                    else if (new Date(e).getDate() === new Date().getDate() && new Date(e).getMonth() === new Date().getMonth() && new Date(e).getFullYear() === new Date().getFullYear()) {
                                                                        setexpectedDate(new Date(e));
                                                                    }
                                                                    else {
                                                                        toast.info('Please Select Valid Delivery Day');
                                                                    }
                                                                }}
                                                                calendarType={"gregory"}
                                                                className={"checkoutCalendar"}
                                                                minDate={new Date(current.setDate(current.getDate() + (Number(timeslots?.time_slots_delivery_starts_from) - 1)))}
                                                                maxDate={new Date(current.setDate(current.getDate() + (Number(timeslots?.time_slots_allowed_days - 1))))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='delivery-time-wrapper checkout-component'>
                                                        <span className='heading'>{t("prefered_time")}</span>
                                                        <div className='d-flex p-3' style={{ flexWrap: "wrap" }}>
                                                            {timeslots === null
                                                                ? <Loader screen='full' />

                                                                : (
                                                                    <>

                                                                        {timeslots?.time_slots?.filter((element) => checkLastOrderTime(element?.last_order_time)).map((timeslot, index) => {
                                                                            return (

                                                                                <div key={index} className='time-slot-container'>
                                                                                    <div>
                                                                                        <input type="radio" name="TimeSlotRadio" id={`TimeSlotRadioId${index}`} defaultChecked={index === 0 ? true : false} onChange={() => {
                                                                                            setexpectedTime(timeslot);
                                                                                        }} />
                                                                                    </div>
                                                                                    <div>

                                                                                        {timeslot?.title}
                                                                                    </div>
                                                                                </div>
                                                                            );

                                                                        })}
                                                                    </>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                </>
                                                :
                                                <>
                                                    <div className='delivery-time-wrapper checkout-component'>
                                                        <span className='heading'>{t("estimate_delivery_date")}</span>
                                                        <div className='d-flex justify-content-start align-items-center estimateDeliveryDate'>
                                                            <span>{t("estimate_delivery_date")} : {getEstimatedDeliveryDate()}</span>
                                                        </div>
                                                    </div>
                                                </>}


                                        </div>

                                        <div className='order-container'>
                                            {user?.user?.balance > 0 ? <div className="promo-section">
                                                <div className="heading">
                                                    <span>{t("Wallet")}</span>
                                                </div>
                                                <div className='promo-wrapper'>
                                                    <div className='promo-container'>
                                                        <div className='d-flex justify-content-between align-items-center'>
                                                            <div className='image-container d-flex align-items-center' style={{ gap: "15px" }}>
                                                                <PiWallet size={35} fill={'var(--secondary-color)'} />
                                                                <span style={{ fontSize: "14px" }}>
                                                                    {t("Wallet Balance")}
                                                                </span>
                                                                <p style={{ color: 'var(--secondary-color', fontSize: "14px" }} className='mb-0 me-2'>
                                                                    {setting?.setting?.currency}
                                                                    {/* {t(parseFloat(user?.user?.balance).toFixed(setting?.setting && setting?.setting?.decimal_point))} */}

                                                                    {t(parseFloat(walletAmount).toFixed(setting?.setting && setting?.setting?.decimal_point))}
                                                                </p>

                                                            </div>
                                                            <div>
                                                                <input type='checkbox' disabled={IsOrderPlaced ? true : false} checked={cart.is_wallet_checked ? true : false} onClick={() => {
                                                                    cart.is_wallet_checked ? dispatch(setWallet({ data: 0 })) : dispatch(setWallet({ data: 1 }));
                                                                }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> : null}

                                            {isFullWalletPay ? <></> :

                                                <div className='payment-wrapper checkout-component'>
                                                    <span className='heading'>{t("payment_method")}</span>
                                                    {setting?.payment_setting?.cod_payment_method === "1" && codAllow == 1
                                                        ? (
                                                            <label className="form-check-label cursorPointer" htmlFor='cod'>
                                                                <div className='payment-selector'>
                                                                    <img src={cod} alt='cod' />
                                                                    <div className="">
                                                                        <span>{t("cash_on_delivery")}</span>
                                                                    </div>
                                                                    <input type="radio" name="payment-method" id='cod' onChange={() => {
                                                                        setpaymentMethod("COD");
                                                                    }} />
                                                                </div>
                                                            </label>
                                                        ) : null}

                                                    {setting?.payment_setting?.razorpay_payment_method === "1"
                                                        ? (
                                                            <label className="form-check-label cursorPointer" htmlFor='razorpay'>
                                                                <div className='payment-selector'>
                                                                    <img src={rozerpay} alt='cod' />
                                                                    <div className="">
                                                                        <span>{t("razorpay")}</span>
                                                                    </div>
                                                                    <input type="radio" name="payment-method" id='razorpay' onChange={() => {
                                                                        setpaymentMethod("Razorpay");
                                                                    }} />
                                                                </div>
                                                            </label>
                                                        ) : null}
                                                    {setting?.payment_setting?.cashfree_payment_method === "1"
                                                        ? (
                                                            <label className="form-check-label cursorPointer" htmlFor='cashfree'>
                                                                <div className='payment-selector'>
                                                                    <img src={cashfree} alt='cod' />
                                                                    <div className="">
                                                                        <span>{t("cashfree")}</span>
                                                                    </div>
                                                                    <input type="radio" name="payment-method" id='cashfree' onChange={() => {
                                                                        setpaymentMethod("Cashfree");
                                                                    }} />
                                                                </div>
                                                            </label>
                                                        ) : null}

                                                    {setting?.payment_setting?.paystack_payment_method === "1"
                                                        ? (
                                                            <label className="form-check-label cursorPointer" htmlFor='paystack'>
                                                                <div className='payment-selector'>
                                                                    <img src={paystack} alt='cod' />
                                                                    <div className="">
                                                                        <span>{t("paystack")}</span>
                                                                    </div>
                                                                    <input type="radio" name="payment-method" id='paystack' onChange={() => {
                                                                        setpaymentMethod("Paystack");
                                                                    }} />
                                                                </div>
                                                            </label>
                                                        ) : null}

                                                    {setting?.payment_setting?.stripe_payment_method === "1"
                                                        ? (
                                                            <label className="form-check-label cursorPointer" htmlFor='stripe'>
                                                                <div className='payment-selector'>
                                                                    <img src={Stripe} alt='stripe' />
                                                                    <div className="">
                                                                        <span className='ps-2'> {t("stripe")}</span>
                                                                    </div>
                                                                    <input type="radio" name="payment-method" id='stripe' onChange={() => {
                                                                        setpaymentMethod("Stripe");
                                                                    }} />
                                                                </div>
                                                            </label>
                                                        ) : null}

                                                    {setting?.payment_setting?.paypal_payment_method === "1"
                                                        ? (
                                                            <>
                                                                <label className="form-check-label cursorPointer" htmlFor='paypal'>
                                                                    <div className='payment-selector'>
                                                                        <img src={paypal} alt='paypal' />
                                                                        <div className="">
                                                                            <span>{t("paypal")}</span>
                                                                        </div>
                                                                        <input type="radio" name="payment-method" id='paypal' onChange={() => {
                                                                            setpaymentMethod("Paypal");
                                                                        }} />
                                                                    </div>
                                                                </label>

                                                            </>
                                                        ) : null}
                                                    {setting?.payment_setting?.midtrans_payment_method === "1" ?
                                                        <label className="form-check-label cursorPointer" htmlFor='midtrans'>
                                                            <div className='payment-selector'>
                                                                <img src={Midtrans} alt='midtrans' />
                                                                <div className="">
                                                                    <span>{t("midtrans")}</span>
                                                                </div>
                                                                <input type="radio" name="payment-method" id='midtrans' onChange={() => {
                                                                    setpaymentMethod("Midtrans");
                                                                }} />
                                                            </div>
                                                        </label>
                                                        : null}
                                                    {setting?.payment_setting?.phonepay_payment_method === "1" ?
                                                        <label className="form-check-label cursorPointer" htmlFor='phonepe'>
                                                            <div className='payment-selector'>
                                                                <img src={PhonepeSVG} alt='phonepe' />
                                                                <div className="">
                                                                    <span>{t("phonepe")}</span>
                                                                </div>
                                                                <input type="radio" name="payment-method" id='phonepe' onChange={() => {
                                                                    setpaymentMethod("Phonepe");
                                                                }} />
                                                            </div>
                                                        </label>
                                                        : null}
                                                    {setting?.payment_setting?.paytabs_payment_method === "1" ? <label className="form-check-label cursorPointer" htmlFor='paytabs'>
                                                        <div className='payment-selector'>
                                                            <img src={paytabs} alt='paytabs' />
                                                            <div className="">
                                                                <span>{t("paytabs")}</span>
                                                            </div>
                                                            <input type="radio" name="payment-method" id='paytabs' onChange={() => {
                                                                setpaymentMethod("Paytabs");
                                                            }} />
                                                        </div>
                                                    </label> : null}


                                                </div>
                                            }

                                            <div className='checkout-component order-instructions-wrapper'>
                                                <div className='heading'>{t("order_note")}</div>
                                                <div className='order-instruction-body'>
                                                    <textarea
                                                        rows={4}
                                                        cols={5}
                                                        value={orderNote}
                                                        className='order-instructions-input'
                                                        placeholder={`${t("order_note_hint")}`}
                                                        onChange={(e) => setOrderNote(e.target.value)}
                                                        maxLength={191}
                                                    />
                                                </div>
                                            </div>

                                            <div className='order-summary-wrapper checkout-component'>

                                                <div className="order-bill">
                                                    <div className='heading'>{t("order_summary")}</div>

                                                    <div className='order-details'>
                                                        {cart.checkout === null || user.user === null
                                                            ? (
                                                                <Loader screen='full' />
                                                            )
                                                            : (

                                                                <div className='summary'>
                                                                    <div className='d-flex justify-content-between'>
                                                                        <span>{t("sub_total")}</span>
                                                                        <div className='d-flex align-items-center'>
                                                                            <span>{setting.setting && setting.setting.currency}   {(cart?.checkout?.items_price)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className='d-flex justify-content-between'>
                                                                        <span>{t("discount")}</span>
                                                                        <div className='d-flex align-items-center'>
                                                                            <span>{setting.setting && setting.setting.currency}   {(cart?.checkout?.discount)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                        </div>
                                                                    </div>
                                                                     <div className='d-flex justify-content-between'>
                                                                        <span>{t("GST")}</span>
                                                                        <div className='d-flex align-items-center'>
                                                                            <span>{setting.setting && setting.setting.currency}   {(cart?.checkout?.gst)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className='d-flex justify-content-between'>
                                                                        <span>{t("sub_total")}</span>
                                                                        <div className='d-flex align-items-center'>
                                                                            <span>{setting.setting && setting.setting.currency}   {(cart?.checkout?.sub_total)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className='d-flex justify-content-between'>
                                                                        <span>{t("delivery_charge")}</span>

                                                                        <div className='d-flex align-items-center'>
                                                                            {cartError === "" ? <span>{setting.setting && setting.setting.currency}  {(cart?.checkout?.delivery_charge?.total_delivery_charge)?.toFixed(setting.setting && setting.setting.decimal_point)}</span> : deliveryCharge}

                                                                        </div>
                                                                    </div>

                                                                    {promoCode.code !== null && <>
                                                                        <div className='d-flex justify-content-between'>
                                                                            <span>{t("discount")}</span>
                                                                            <div className='d-flex align-items-center'>
                                                                                <span>- {setting.setting && setting.setting.currency}    {Number(promoCode.discount)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </>}
                                                                    {walletDeductionAmt ? <>
                                                                        <div className='d-flex justify-content-between'>
                                                                            <span>{t("Wallet")}</span>
                                                                            <div className='d-flex align-items-center'>

                                                                                <span>- {setting.setting && setting.setting.currency}    {Number(walletDeductionAmt)?.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </> : <></>}


                                                                    <div className='d-flex justify-content-between total'>
                                                                        <span>{t("total")}</span>
                                                                        <div className='d-flex align-items-center total-amount' style={{ color: "var(--secondary-color)" }}>
                                                                            <span>
                                                                                {setting.setting && setting.setting.currency}
                                                                                {Number(totalPayment)?.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                            </span>

                                                                        </div>
                                                                    </div>
                                                                    {loadingPlaceOrder
                                                                        ?
                                                                        <Loader screen='full' background='none' content={"Your transaction is being processed.Please don't refresh the page."} />
                                                                        : cartError !== "" ? <div>
                                                                            <p className='checkout-warning-msg'><IoIosWarning size={20} />{cartError}</p>

                                                                        </div> : <>
                                                                            {
                                                                                (setting.payment_setting.cod_payment_method === "1" && codAllow == '1') ||
                                                                                    setting.payment_setting.razorpay_payment_method === "1" ||
                                                                                    setting.payment_setting.paystack_payment_method === "1" ||
                                                                                    setting.payment_setting.stripe_payment_method === "1" ||
                                                                                    setting.payment_setting.paypal_payment_method === "1" ||
                                                                                    setting?.payment_setting?.phonepay_payment_method === "1" ||
                                                                                    setting?.payment_setting?.midtrans_payment_method === "1" ||
                                                                                    setting?.payment_setting?.cashfree_payment_method === "1" ||
                                                                                    setting?.payment_setting?.paytabs_payment_method === "1"
                                                                                    ? (
                                                                                        <div className='button-container'>
                                                                                            {paymentMethod === "Stripe" && setting
                                                                                                ? <motion.button whiletap={{ scale: 0.8 }} type='button' className='checkout' onClick={(e) => { e.preventDefault(); HandlePlaceOrder(); }}>{t("place_order")}</motion.button>
                                                                                                : <motion.button whiletap={{ scale: 0.8 }} type='button' className='checkout' onClick={(e) => { e.preventDefault(); HandlePlaceOrder(); }}>{t("place_order")}</motion.button>
                                                                                            }
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className='button-container'>
                                                                                            <button type='button' className='checkout' disabled>{t("enable_payment_methods")}</button>
                                                                                        </div>
                                                                                    )
                                                                            }
                                                                        </>
                                                                    }

                                                                </div>)}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        }


                        <Promo show={showPromoOffcanvas} setShow={setShowPromoOffcanvas} />

                    </section>
                    {/* <Modal
                        className='location'
                        id="locationModal"
                        centered
                        open={locModal}
                        transitionName=''
                    >
                        <Location isLocationPresent={isLocationPresent} setisLocationPresent={setisLocationPresent}
                            showModal={locModal} setLocModal={setLocModal} bodyScroll={setBodyScroll} />
                    </Modal> */}
                    <Modal id="stripeModal" size='lg' centered show={stripeModalShow}  >
                        <Modal.Header onClick={() => setStripeModalShow(false)

                        } className='header justify-content-between'>
                            <span style={{ color: '#33a36b', fontSize: '18px', fontWeight: 'bolder' }}>{process.env.REACT_APP_WEB_NAME} Payment</span>
                            <span style={{ cursor: 'pointer' }}>
                                <AiOutlineCloseCircle size={20} />
                            </span>

                        </Modal.Header>
                        <Modal.Body>

                            {stripeOrderId === null || stripeClientSecret === null || stripeTransactionId === null
                                ? <Loader width='100%' height='100%' />
                                :
                                <Elements stripe={stripePromise} orderID={stripeOrderId} client_secret={stripeClientSecret} transaction_id={stripeTransactionId} amount={totalPayment}>
                                    <InjectCheckout setIsOrderPlaced={setIsOrderPlaced} setShow={setStripeModalShow} orderID={stripeOrderId} client_secret={stripeClientSecret} transaction_id={stripeTransactionId} amount={totalPayment}
                                        setWalletAmount={setWalletAmount} walletAmount={user?.user?.balance}
                                        walletDeductionAmt={walletDeductionAmt}
                                    />
                                </Elements>
                            }

                        </Modal.Body>
                    </Modal>
                </>
                :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>
            }
        </>
    );
};

export default Checkout;
