import { CardElement, ElementsConsumer } from "@stripe/react-stripe-js";
import Loader from "../loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { addUserBalance } from "../../model/reducer/authReducer";



const CARD_OPTIONS = {
    iconStyle: "solid",
    style: {
        base: {
            fontWeight: 500,
            fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            ":-webkit-autofill": { color: "#fce883" },
            "::placeholder": { color: "#87bbfd" },
            border: "2px solid black"
        },
        invalid: {
            color: "#ffc7ee"
        }
    }
};

const StripeModal = (props) => {

    const dispatch = useDispatch();

    const user = useSelector((state) => state.user);

    const [loadingPay, setloadingPay] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { stripe, elements, transaction_id } = props;

        setloadingPay(true);
        if (!stripe || !elements) {
            setloadingPay(false);
            return;
        }

        if (!transaction_id) {
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
            toast.error(error.message);
            props.setShow(false);
            props.setAddWalletModal(false);

        } else if (paymentIntent.status === 'succeeded') {
            await api.addTransaction(user?.jwtToken, null, props.transaction_id, "Stripe", "wallet", props.amount)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        setloadingPay(false);
                        props.setShow(false);
                        dispatch(addUserBalance({ data: props.amount }));
                        props.setAddWalletModal(false);
                        toast.success(result.message);
                        props.fetchTransactions();
                    }
                    else {
                        setloadingPay(false);
                    }
                })
                .catch(error => console.log(error));
        } else {
            setloadingPay(false);
            toast.error('Payment failed');
            props.setShow(false);
            props.setAddWalletModal(false);
        }
    };
    return (
        <>
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
        <ElementsConsumer client_secret={props.client_secret} transaction_id={props.transaction_id} amount={props.amount}>
            {({ stripe, elements, orderID, client_secret, transaction_id, amount }) => (
                <>
                    <StripeModal stripe={stripe}
                        setAddWalletModal={props.setAddWalletModal}
                        setShow={props.setShow}
                        elements={elements}
                        client_secret={props.client_secret}
                        transaction_id={props.transaction_id}
                        amount={props.amount}
                        fetchTransactions={props.fetchTransactions}
                    ></StripeModal>
                </>
            )}
        </ElementsConsumer>
    );
}