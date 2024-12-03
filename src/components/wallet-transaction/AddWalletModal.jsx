import React, { useCallback, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import "./add-wallet-money.css";
import PaypalSVG from "../../utils/Paypal.svg";
import PayStackSVG from "../../utils/Paystack.svg";
import RazorPaySVG from "../../utils/Razorpay.svg";
import StripeSVG from "../../utils/Stripe.svg";
import MidtransSVG from "../../utils/Icons/Midtrans.svg";
import PhonePeSVG from "../../utils/Icons/Phonepe.svg";
import api from '../../api/api';
import { useRazorpay } from 'react-razorpay';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { addUserBalance } from '../../model/reducer/authReducer';
import PaystackPop from '@paystack/inline-js';
import { Elements } from '@stripe/react-stripe-js';
import Loader from '../loader/Loader';
import { loadStripe } from '@stripe/stripe-js';
import InjectCheckout from './AddWalletStripeModal';
import cashfree from '../../utils/ic_cashfree.svg';
import paytabs from '../../utils/Icons/ic_paytabs.svg';

const AddWalletModal = (props) => {

    const { t } = useTranslation();

    const setting = useSelector(state => state.setting);
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [walletAmount, setWalletAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [stripeTransId, setStripeTransId] = useState(null);
    const [stripeClientSecret, setstripeClientSecret] = useState(null);
    const [stripeModalShow, setStripeModalShow] = useState(false);
    const [loader, setLoader] = useState(false);

    const handleAmountChange = (e) => {
        const amt = parseFloat(e.target.value);
        setWalletAmount(amt);
    };

    const handlePmtMethodChange = (value) => {
        setPaymentMethod(value);
    };

    const stripePromise = loadStripe(setting.payment_setting && setting.payment_setting.stripe_publishable_key);


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

    const handleRazorpayPayment = useCallback(async (razorpay_transaction_id, amount, name, email, mobile, app_name) => {
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
                // console.log(res);
                if (res.razorpay_payment_id) {
                    await api.addTransaction(user?.jwtToken, null, razorpay_transaction_id, "Razorpay", "wallet", amount)
                        .then(response => response.json())
                        .then(result => {
                            // console.log(result);
                            if (result.status === 1) {
                                props.setShowModal(false);
                                toast.success(result.message);
                                dispatch(addUserBalance({ data: parseInt(amount) }));
                                props.fetchTransactions();
                            }
                            else {
                                toast.error(result.message);
                            }
                        })
                        .catch(error => console.log(error));
                }


            },
            modal: {
                confirm_close: true,
                ondismiss: async (reason) => {
                    if (reason === undefined) {
                        props.setShowModal(false);
                        setPaymentMethod("");
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
            toast.error(response);
            props.setShowModal(false);
        });
        rzpay.on('payment.failed', function (response) {
            toast.error(response);
        });
        console.log("hello world from wallet")
        rzpay.open();
    }, [Razorpay]);

    const handlePayStackPayment = (email, amount, currency, support_email, orderid) => {
        let handler = PaystackPop.setup({
            key: setting.payment_setting && setting.payment_setting.paystack_public_key,
            email: email,
            amount: parseFloat(amount) * 100,
            currency: currency,
            ref: (new Date()).getTime().toString(),
            label: support_email,
            callback: async function (response) {
                await api.addTransaction(user?.jwtToken, null, response.reference, "Paystack", "wallet", amount)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            toast.success(result.message);
                            dispatch(addUserBalance({ data: parseInt(amount) }));
                            props.setShowModal(false);
                            props.fetchTransactions();
                        }
                        else {
                            toast.error(result.message);
                            props.setShowModal(false);
                        }
                    })
                    .catch(error => console.log(error));
            }
        });

        handler.openIframe();
    };
    const handlePaypalPayment = async (redirectUrl) => {
        const newWindow = window.open(redirectUrl, "_parent");
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (paymentMethod == "") {
            return toast.error(t("please_select_payment_method"));
        }
        try {
            let response, result;
            if (paymentMethod === "paypal" || paymentMethod === "stripe" || paymentMethod === "razorpay" || paymentMethod === "midtrans" || paymentMethod === "phonepe" || paymentMethod === "cashfree" || paymentMethod === "paytabs") {
                response = await api.initiate_transaction(user?.jwtToken, null, paymentMethod, "wallet", walletAmount);
                result = await response.json();
            }
            if (paymentMethod === "razorpay") {
                handleRazorpayPayment(result?.data?.transaction_id, walletAmount, user?.user?.name, user?.user?.email, user?.user?.mobile, setting.setting?.app_name);
            } else if (paymentMethod === "paystack") {
                handlePayStackPayment(user?.user?.email, walletAmount, setting.payment_setting.paystack_currency_code, setting.setting.support_email);
            } else if (paymentMethod === "stripe") {
                setStripeTransId(result.data?.id);
                setstripeClientSecret(result.data?.client_secret);
                setStripeModalShow(true);
            } else if (paymentMethod === "paypal") {
                handlePaypalPayment(result?.data?.paypal_redirect_url);
            } else if (paymentMethod === "midtrans") {
                const windowWidth = 700;
                const windowHeight = 700;
                const windowLeft = window.screen.width / 2 - windowWidth / 2;
                const windowTop = window.screen.height / 2 - windowHeight / 2;
                const windowFeatures = `width=${windowWidth},height=${windowHeight},left=${windowLeft},top=${windowTop},resizable=yes,scrollbars=yes,status=yes`;
                const paymentWindow = window.open(result?.data?.snapUrl, "_blank", windowFeatures);
                const messageEventListener = async (event) => {
                    // console.log(event.data);
                    if (event.data === "Recharge Done") {
                        paymentWindow.close();
                        dispatch(addUserBalance({ data: walletAmount }));
                        toast.success(t("wallet_recharge_successfull"));
                        props.setShowModal(false);
                        props.fetchTransactions();
                        // Remove the event listener once the task is completed
                        window.removeEventListener("message", messageEventListener);
                    }
                };

                // Add the event listener
                window.addEventListener("message", messageEventListener);
                paymentWindow.onbeforeunload = () => {
                    // Remove the event listener if the payment window is closed without making payment
                    window.removeEventListener("message", messageEventListener);
                };
            } else if (paymentMethod === "phonepe") {
                const windowWidth = 700;
                const windowHeight = 700;
                const windowLeft = window.screen.width / 2 - windowWidth / 2;
                const windowTop = window.screen.height / 2 - windowHeight / 2;
                const windowFeatures = `width=${windowWidth},height=${windowHeight},left=${windowLeft},top=${windowTop},resizable=yes,scrollbars=yes,status=yes`;
                const paymentWindow = window.open(result?.data?.redirectUrl, "_blank", windowFeatures);
                const messageEventListener = async (event) => {
                    // console.log(event.data);
                    if (event.data === "Recharge Done") {
                        paymentWindow.close();
                        dispatch(addUserBalance({ data: walletAmount }));
                        toast.success(t("wallet_recharge_successfull"));
                        window.removeEventListener("message", messageEventListener);
                        props.setShowModal(false);
                        props.fetchTransactions();
                        // Remove the event listener once the task is completed
                    }
                };
                // Add the event listener
                window.addEventListener("message", messageEventListener);
                paymentWindow.onbeforeunload = () => {
                    // Remove the event listener if the payment window is closed without making payment
                    window.removeEventListener("message", messageEventListener);
                };
            } else if (paymentMethod === "cashfree") {
                const paymentWindow = window.open(result?.data?.redirectUrl, "_blank");
                const messageEventListener = async (event) => {
                    // console.log(event.data);
                    if (event.data === "Recharge Done") {
                        paymentWindow.close();
                        dispatch(addUserBalance({ data: walletAmount }));
                        toast.success(t("wallet_recharge_successfull"));
                        window.removeEventListener("message", messageEventListener);
                        props.setShowModal(false);
                        props.fetchTransactions();
                        // Remove the event listener once the task is completed
                    }
                };
                // Add the event listener
                window.addEventListener("message", messageEventListener);
                paymentWindow.onbeforeunload = () => {
                    // Remove the event listener if the payment window is closed without making payment
                    window.removeEventListener("message", messageEventListener);
                };
            } else if (paymentMethod === "paytabs") {
                const paymentWindow = window.open(result?.data?.redirectUrl, "_blank");
                const messageEventListener = async (event) => {
                    // console.log(event.data);
                    if (event.data === "Recharge Done") {
                        paymentWindow.close();
                        dispatch(addUserBalance({ data: walletAmount }));
                        toast.success(t("wallet_recharge_successfull"));
                        window.removeEventListener("message", messageEventListener);
                        props.setShowModal(false);
                        props.fetchTransactions();
                        // Remove the event listener once the task is completed
                    }
                };
                // Add the event listener
                window.addEventListener("message", messageEventListener);
                paymentWindow.onbeforeunload = () => {
                    // Remove the event listener if the payment window is closed without making payment
                    window.removeEventListener("message", messageEventListener);
                };
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <>

            <Modal
                className='addMoneyToWalletModal'
                size='md'
                centered
                show={props.showModal}
                backdrop={"static"}
            >
                <Modal.Header className='d-flex justify-content-between'>
                    <div className='fw-bold modalHeading'>
                        {t("add_to_wallet")}
                    </div>
                    <div className='closeModalBtn' onClick={() => {
                        props.setShowModal(false);
                        setPaymentMethod("");
                        setWalletAmount(0);
                        setStripeModalShow(false);
                        setStripeTransId(null);
                        setstripeClientSecret(null);
                    }}><AiOutlineCloseCircle size={34} /></div>
                </Modal.Header>
                <Modal.Body>
                    {!loader ? <form onSubmit={handleSubmit}>
                        <div className='d-flex flex-column justify-content-start'>
                            <div>
                                <div className='mb-3'>{t("amount")}</div>
                                <div className='w-100 mb-5'>
                                    <input
                                        type='number'
                                        required
                                        className='moneyAmountPlaceholder w-100 text-start'
                                        placeholder={t("type_amount")}
                                        step=".01"
                                        onChange={handleAmountChange}
                                    />
                                </div>
                                <div>
                                    <div className='mb-4'>
                                        {t("choose_payment_method")}
                                    </div>
                                    <div className='d-flex flex-column gap-4'>
                                        {setting?.payment_setting?.paypal_payment_method === "1" ?
                                            <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                                <div>
                                                    <img className='me-3' src={PaypalSVG} alt='paypalSVG' />
                                                    {t("paypal")}
                                                </div>
                                                <div>
                                                    <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("paypal")} />
                                                </div>
                                            </div>
                                            :
                                            null}
                                        {setting?.payment_setting?.razorpay_payment_method === "1" ?
                                            <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                                <div>

                                                    <img className='me-3' src={RazorPaySVG} alt='razorPaySVG' />
                                                    {t("razorpay")}
                                                </div>
                                                <div>
                                                    <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("razorpay")} />
                                                </div>
                                            </div>
                                            :
                                            null}
                                        {setting?.payment_setting?.cashfree_payment_method === "1" ?
                                            <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                                <div className='d-flex align-items-center cashfree-div'>
                                                    <img className='me-3' src={cashfree} alt='cashfreeSVG' />
                                                    {t("cashfree")}
                                                </div>
                                                <div>
                                                    <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("cashfree")} />
                                                </div>
                                            </div>
                                            :
                                            null}
                                        {setting?.payment_setting?.paystack_payment_method === "1" ?
                                            <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                                <div>

                                                    <img className='me-3' src={PayStackSVG} alt='paystackSVG' />
                                                    {t("paystack")}
                                                </div>
                                                <div>
                                                    <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("paystack")} />
                                                </div>
                                            </div>
                                            :
                                            null}
                                        {setting?.payment_setting?.stripe_payment_method === "1" ?
                                            <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                                <div>
                                                    <img className='me-3' src={StripeSVG} alt='stripeSVG' />
                                                    {t("stripe")}
                                                </div>
                                                <div>
                                                    <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("stripe")} />
                                                </div>
                                            </div>
                                            :
                                            null}
                                        {setting?.payment_setting?.midtrans_payment_method === "1" ?
                                            <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                                <div>
                                                    <img className='MidtransSVG me-3' src={MidtransSVG} alt='MidtransSVG' />
                                                    {t("midtrans")}
                                                </div>
                                                <div>
                                                    <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("midtrans")} />
                                                </div>
                                            </div>
                                            :
                                            null}
                                        {setting?.payment_setting?.phonepay_payment_method === "1" ? <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>
                                                <img className='PhonePeSVG me-2' src={PhonePeSVG} alt='PhonePeSVG' />
                                                {t("phonepe")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("phonepe")} />
                                            </div>
                                        </div> : null}
                                        {setting?.payment_setting?.paytabs_payment_method === "1" ? <div className='d-flex flex-row justify-content-between align-items-center paymentContainer'>
                                            <div>
                                                <img className='PhonePeSVG me-2' src={paytabs} alt='PaytabsSVG' />
                                                {t("paytabs")}
                                            </div>
                                            <div>
                                                <input type='radio' id='paymentRadioBtn' name='paymentRadioBtn' onChange={() => handlePmtMethodChange("paytabs")} />
                                            </div>
                                        </div> : null}

                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className='d-flex justify-content-end'>
                            <button type='submit' className='payButton'>{t("add_money")}</button>
                        </div>
                    </form>
                        :
                        <Loader width={"100%"} height={"600px"} />
                    }
                </Modal.Body>
            </Modal>
            <Modal id="stripeModal" size='lg' centered show={stripeModalShow}>
                <Modal.Header onClick={() => setStripeModalShow(false)

                } className='header justify-content-between'>
                    <span style={{ color: '#33a36b', fontSize: '18px', fontWeight: 'bolder' }}>{process.env.REACT_APP_WEB_NAME} Payment</span>
                    <span style={{ cursor: 'pointer' }}>
                        <AiOutlineCloseCircle size={20} />
                    </span>

                </Modal.Header>
                <Modal.Body>

                    {stripeClientSecret === null || stripeTransId === null
                        ? <Loader width='100%' height='100%' />
                        :
                        <Elements stripe={stripePromise} client_secret={stripeClientSecret} transaction_id={stripeTransId} amount={walletAmount}>
                            <InjectCheckout
                                setAddWalletModal={props.setShowModal}
                                setShow={setStripeModalShow}
                                stripe={stripePromise}
                                client_secret={stripeClientSecret}
                                transaction_id={stripeTransId}
                                amount={walletAmount}
                                fetchTransactions={props.fetchTransactions}
                            />
                        </Elements>
                    }

                </Modal.Body>
            </Modal>
        </>

    );
};


export default AddWalletModal;