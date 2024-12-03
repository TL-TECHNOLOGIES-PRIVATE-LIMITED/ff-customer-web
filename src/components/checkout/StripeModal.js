import { ElementsConsumer, CardElement } from '@stripe/react-stripe-js';
import React, { useState, useRef } from 'react';
import './checkout.css';
import api from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';
import { Button, Modal } from 'react-bootstrap';
import animate1 from '../../utils/order_placed_back_animation.json';
import animate2 from '../../utils/order_success_tick_animation.json';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCart, setCartCheckout, setCartProducts, setCartSubTotal, setWallet } from '../../model/reducer/cartReducer';
import { deductUserBalance } from '../../model/reducer/authReducer';

const CARD_OPTIONS = {
    iconStyle: "solid",
    style: {
        base: {
            // iconColor: "#c4f0ff",
            fontWeight: 500,
            fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            ":-webkit-autofill": { color: "#fce883" },
            "::placeholder": { color: "#87bbfd" },
            // border: "2px solid black"
        },
        invalid: {
            // iconColor: "#ffc7ee",
            color: "#ffc7ee"
        }
    }
};



const StripeModal = (props) => {

    const closeModal = useRef();
    const navigate = useNavigate();

    const dispatch = useDispatch();


    const user = useSelector((state) => state.user);

    const [loadingPay, setloadingPay] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { stripe, elements, orderID } = props;

        setloadingPay(true);
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            setloadingPay(false);
            // props.setShow(false)
            return;
        }

        if (!orderID) {
            setloadingPay(false);
            props.setShow(false);
            return;
        }



        const SK = props.client_secret;

        // Confirm the PaymentIntent with the Payment Element
        const { paymentIntent, error } = await stripe.confirmCardPayment(SK, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: user.user && user.user.name,
                    address: {
                        line1: '510 Townsend St',
                        postal_code: '98140',
                        city: 'San Francisco',
                        state: 'CA',
                        country: 'US',
                    },

                },
            },
        },);
        if (error) {
            // console.log(error.message);
            api.deleteOrder(user?.jwtToken, orderID);
            toast.error(error.message);
            props.setWalletAmount(props.walletAmount);
            dispatch(setWallet({ data: 0 }));
            props.setShow(false);

        } else if (paymentIntent.status === 'succeeded') {
            // Redirect the customer to a success page
            // window.location.href = '/success';
            // props.setShow(false)
            await api.addTransaction(user?.jwtToken, orderID, props.transaction_id, "Stripe", "order")
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        setShow(true);
                        setIsOrderPlaced(true);
                        setloadingPay(false);
                        dispatch(setCartProducts({ data: [] }));
                        dispatch(setCartSubTotal({ data: 0 }));
                    }
                    else {
                        setloadingPay(false);
                    }
                    // closeModal.current.click()
                })
                .catch(error => console.log(error));
            dispatch(deductUserBalance({ data: props.walletDeductionAmt }));
            props.setShow(false);
            props.setIsOrderPlaced(true);
        } else {
            // Handle other payment status scenarios
            api.deleteOrder(user?.jwtToken, orderID);
            setloadingPay(false);
            console.log('Payment failed');
            props.setShow(false);
            setIsOrderPlaced(false);
        }
    };

    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => {
        api.removeCart(user?.jwtToken).then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    dispatch(setCart({ data: null }));
                    dispatch(setCartCheckout({ data: null }));
                }
            });


        setShow(false);
        props.setShow(false);
        navigate('/');
    };
    return (
        <>
            {isOrderPlaced ?
                <>
                    <Modal
                        show={show}
                        keyboard={true}
                        className='success_modal'
                    >
                        <Lottie className='lottie-content' animationData={animate1} loop={true}></Lottie>
                        <Modal.Header closeButton className='flex-column-reverse success_header'>
                            <Modal.Title><Lottie animationData={animate2} loop={true}></Lottie></Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='success_body'>
                            Order Placed Successfully
                        </Modal.Body>
                        <Modal.Footer className="success_footer">
                            <Button variant="primary" onClick={handleClose} className='checkout_btn'>
                                Go to Home Page
                            </Button>

                        </Modal.Footer>
                    </Modal>
                </>
                : null}

            <div className="modal-body">
                <div className='stripe-container d-flex flex-column p-0'>
                    <form onSubmit={handleSubmit} id="stripe-form" className='row p-5 border-3'>
                        <fieldset className='FormGroup p-4'>
                            <div className="FormRow">
                                <CardElement options={CARD_OPTIONS} />
                            </div>
                        </fieldset>
                        {loadingPay
                            ? <Loader screen='full' background='none' />
                            :
                            <button whiletap={{ scale: 0.8 }} type='submit' disabled={!props.stripe} className='pay-stripe'>Pay</button>
                        }
                    </form>
                </div>

            </div>
        </>
    );
};


export default function InjectCheckout(props) {
    return (
        <ElementsConsumer orderID={props.orderID} client_secret={props.client_secret} transaction_id={props.transaction_id} amount={props.amount}>
            {({ stripe, elements, orderID, client_secret, transaction_id, amount }) => (
                <>
                    <StripeModal stripe={stripe}
                        setShow={props.setShow}
                        setIsOrderPlaced={props.setIsOrderPlaced}
                        elements={elements}
                        orderID={props.orderID}
                        client_secret={props.client_secret}
                        transaction_id={props.transaction_id}
                        amount={props.amount}
                        setWalletAmount={props.setWalletAmount}
                        walletAmount={props.walletAmount}
                        walletDeductionAmt={props.walletDeductionAmt}
                    ></StripeModal>
                </>
            )}
        </ElementsConsumer>
    );
}








