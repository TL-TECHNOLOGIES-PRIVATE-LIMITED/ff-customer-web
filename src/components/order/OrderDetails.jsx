import React, { useEffect, useRef, useState } from 'react';
import coverImg from '../../utils/cover-img.jpg';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import './order.css';
import api from '../../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import RateProductModal from '../rate-product/RateProductModal';
import axios from 'axios';
import RateProductStar from "../../utils/stars.svg";
import { LuStar } from "react-icons/lu";
import UpdateRatingModal from '../rate-product/UpdateRatingModal';
import { Modal } from 'react-bootstrap';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';



const OrderDetails = React.memo(() => {
    const { t } = useTranslation();

    const setting = useSelector(state => state.setting);
    const user = useSelector(state => state?.user?.user);
    const jwtToken = useSelector(state => state.user?.jwtToken);
    // console.log(user);

    const [orderData, setOrderData] = useState(null);
    const [orderStatus, setOrderStatus] = useState(t("placed"));
    const [showPdtRatingModal, setShowPdtRatingModal] = useState(false);
    const [ratingProductId, setRatingProductId] = useState(0);
    const [editRatingId, setEditRatingId] = useState(0);
    const [showRatingEditModal, setShowRatingEditModal] = useState(false);
    const [isNetworkError, setIsNetworkError] = useState(false);
    // const [showReturnModal, setShowReturnModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState([]);
    const urlParams = useParams();

    // useEffect(() => {
    // }, [])
    useEffect(() => {
        setShowReturnModal(Array(orderData?.items?.length).fill(false))
        setShowCancelModal(Array(orderData?.items?.length).fill(false))
        if (orderData?.active_status === "6") {
            setOrderStatus(t("delivered"));
        } else if (orderData?.active_status === "5") {
            setOrderStatus(t("out_for_delivery"));
        } else if (orderData?.active_status === "4") {
            setOrderStatus(t("placed"));
        } else if (orderData?.active_status === "3") {
            setOrderStatus(t("confirmed"));
        }
        else if (orderData?.active_status === "7") {
            setOrderStatus(t("cancelled"));
        }
        else if (orderData?.active_status === "8") {
            setOrderStatus(t("returned"));
        }
    }, [orderData]);



    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };
    const fetchOrderDetails = async () => {
        api.getOrders(jwtToken, null, null, null, urlParams?.id).then(result => result.json()).then((response) => {

            if (response.status) {
                setOrderData(response.data[0]);
            } else {
                toast.error(response.message);
            }

        }).catch(err => {
            console.log(err)
            const isNoInternet = ValidateNoInternet(err);
            if (isNoInternet) {
                setIsNetworkError(true);
            }
        });

    };


    useEffect(() => {
        fetchOrderDetails();
        // console.log(orderData, 'orderDaraaa')
    }, [editRatingId, showPdtRatingModal]);

    const returnRef = useRef(null);
    const cancelRef = useRef(null);

    const getInvoice = async (Oid) => {
        let postData = new FormData();
        postData.append('order_id', Oid);
        axios({
            url: `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_SUBURL}/invoice_download`,
            method: 'post',
            responseType: 'blob',
            /*responseType: 'application/pdf',*/
            data: postData,
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        }).then(response => {
            var fileURL = window.URL.createObjectURL(new Blob([response.data]));
            var fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'Invoice-No:' + Oid + '.pdf');
            document.body.appendChild(fileLink);
            fileLink.click();
        }).catch(error => {
            if (error.request.statusText) {
                toast.error(error.request.statusText);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong!");
            }
        });
    };
    const navigate = useNavigate();

    const handleUpdateStatus = async (item_id, status, return_reason) => {
        await api.updateOrderStatus(jwtToken, orderData?.id, item_id, status, return_reason)
            .then((result) => result.json())
            .then((response) => {
                if (response.status) {
                    fetchOrderDetails();
                    // response.data && setOrderData(response.data);
                    // console.log(response.data, "update_order_status");
                    toast.success(response.message);
                    setShowReturnModal(false);
                    setShowCancelModal(false)
                } else if (response.message == "This Order Item is already Returned!") {
                    fetchOrderDetails();
                    toast.error(response.message);
                } else {
                    toast.info(response.message);
                }
                setShowCancelModal(false)
                setShowReturnModal(false);
            }).catch((error) => {
                console.error(error);
            });
    };

    const convertToAMPM = (transactionDate) => {
        const dateTimeObj = new Date(transactionDate);
        const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        const timeInAMPMFormat = dateTimeObj.toLocaleString('en-US', options);
        console.log("updated date", timeInAMPMFormat)
        return timeInAMPMFormat;
    };

    return (
        <>
            {!isNetworkError ?
                <section className="order-details-page">
                    {/* <div className='cover'>
                        <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                        <div className='page-heading'>
                            <h3>{t("order_details")}</h3>
                            <p><strong onClick={() => navigate('/')}>{t("home")}</strong> / <span> <span onClick={() => navigate('/profile/orders')}>{t("order")}</span> / {orderData?.id}</span></p>
                        </div>
                    </div> */}

                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-xl-9">
                                <div className="order-container">
                                    <div className="list-container">

                                        <div className="container-heading">
                                            <span>
                                                {t('items')}
                                            </span>
                                        </div>
                                        <div className="container-body">
                                            <div className="table-container">
                                                <table className="table">

                                                    <thead>
                                                        <th>{t('product')}</th>
                                                        <th>{t('price')}</th>
                                                        {orderData?.items?.some((item) => (Number(item?.active_status) == 6)) ? <th>{t('rating')}</th> : null}
                                                    </thead>
                                                    <tbody>
                                                        {/* console.log(item); */}
                                                        {orderData?.items?.map((item, index) => {
                                                            return (
                                                                <React.Fragment key={item?.id}>
                                                                    <tr className={Number(item?.active_status) > 6 ? 'disabled' : ''}>
                                                                        <td>
                                                                            <div className="product">

                                                                                <div className="image-container">
                                                                                    <img src={item.image_url} alt="" />
                                                                                </div>
                                                                                <div className="item-container">
                                                                                    <span className='item-name'>{item.name}</span>
                                                                                    <span className='item-quantity'> X {item.quantity}</span>
                                                                                    <span className='item-variant'>{` ${item.measurement} ${item.unit}`}</span>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="price-container">
                                                                                <span className="discounted-price">
                                                                                    {`${setting.setting?.currency} ${item.price}`}
                                                                                </span>
                                                                            </div>
                                                                            <div className="actions-container">
                                                                                {Number(item?.active_status) == 6 && item?.return_status == 1 && item?.return_requested === null ?
                                                                                    <span className="return">
                                                                                        <button onClick={() => setShowReturnModal(prevState => {
                                                                                            const newState = [...prevState];
                                                                                            newState[index] = true;
                                                                                            return newState;
                                                                                        })}>{t('return')}</button>
                                                                                    </span>
                                                                                    : null
                                                                                }

                                                                                {(Number(item?.active_status) <= 6) && (Number(item?.active_status) <= item?.till_status) && (item?.cancelable_status == 1) ?
                                                                                    <span className="cancel">
                                                                                        <button onClick={() => setShowCancelModal(prevState => {
                                                                                            const newState = [...prevState];
                                                                                            newState[index] = true;
                                                                                            return newState;
                                                                                        })}>{t('cancel')}</button>
                                                                                        {/* <button onClick={() => handleUpdateStatus(item?.id, 7)}>{t('cancel')}</button> */}
                                                                                    </span>
                                                                                    : null
                                                                                }
                                                                                {Number(item?.active_status) == 7 ?
                                                                                    <span className="cancel">
                                                                                        <button>{t('cancelled')}</button>
                                                                                    </span>
                                                                                    : null
                                                                                }

                                                                                {Number(item?.active_status) == 8 ?
                                                                                    <span className="return">
                                                                                        <button >{t('returned')}</button>
                                                                                    </span>
                                                                                    : null
                                                                                }

                                                                                {Number(item?.return_requested === 1) ?
                                                                                    <span className="return">
                                                                                        <button>{t('return_requested')}</button>
                                                                                    </span>
                                                                                    : null
                                                                                }
                                                                                {Number(item?.return_requested === 3) ?
                                                                                    <span className="returned">
                                                                                        <button >{t('return_rejected')}</button>
                                                                                    </span>
                                                                                    : null
                                                                                }

                                                                            </div>

                                                                        </td>
                                                                        {(Number(item?.active_status) == 6) ?
                                                                            <td>
                                                                                <div className='rateProductText' >
                                                                                    {item.item_rating.find((rating) => rating.user.id === user.id) ?
                                                                                        <div className='pb-4' onClick={() => {
                                                                                            setRatingProductId(item.product_id);
                                                                                            setShowRatingEditModal(true);
                                                                                            setEditRatingId(item.item_rating.find((rating) => rating.user.id === user.id)?.id);
                                                                                        }}>
                                                                                            <span className='me-2' >
                                                                                                {t("you_rated")}
                                                                                            </span>
                                                                                            <span className="userRatedStarContainer">
                                                                                                <LuStar fill='white' stroke='white' />
                                                                                                {item?.item_rating?.find((rating) => rating?.user?.id === user?.id)?.rate}
                                                                                            </span>
                                                                                        </div>
                                                                                        :
                                                                                        <div className='rateProductText' onClick={() => {
                                                                                            setRatingProductId(item.product_id);
                                                                                            setShowPdtRatingModal(true);
                                                                                        }}>
                                                                                            <img className='me-2' src={RateProductStar} alt='rateProductStar' />
                                                                                            {t("review_and_rating")}
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            </td> : null}
                                                                    </tr>
                                                                    {showCancelModal[index] ?
                                                                        <Modal
                                                                            size='md'
                                                                            show={showCancelModal[index]}
                                                                            centered
                                                                            // onHide={() => setShowReturnModal(false)}
                                                                            onHide={() => setShowCancelModal(prevState => {
                                                                                const newState = [...prevState];
                                                                                newState[index] = false;
                                                                                return newState;
                                                                            })}
                                                                            backdrop="static"
                                                                        >
                                                                            <Modal.Header className='d-flex justify-content-between returnProductModalHeader'>
                                                                                <h5 className='title'>{t("cancel_order_item")}</h5>
                                                                                <AiOutlineCloseCircle className='cursorPointer' size={28} fill='black' onClick={() => setShowCancelModal(prevState => {
                                                                                    const newState = [...prevState];
                                                                                    newState[index] = false;
                                                                                    return newState;
                                                                                })} />
                                                                            </Modal.Header>
                                                                            <Modal.Body className='returnProductModalBody'>
                                                                                <form onSubmit={(e) => {
                                                                                    e.preventDefault();
                                                                                    // if (!returnRef.current.value.trim()) {
                                                                                    //     toast.error(t('please_type_return_reason'));
                                                                                    //     return; // Don't proceed further if the textarea is empty
                                                                                    // }
                                                                                    // handleUpdateStatus(item?.id, 8, returnRef.current.value);
                                                                                    handleUpdateStatus(item?.id, 7, cancelRef.current.value)
                                                                                }}>
                                                                                    <div className='d-flex flex-column justify-content-center'>
                                                                                        <label htmlFor='reasonTextArea' className='my-3 reasonLabel'>
                                                                                            {t("cancel_reason")}
                                                                                        </label>
                                                                                        <textarea
                                                                                            ref={cancelRef}
                                                                                            id="reasonTextArea"
                                                                                            rows={8}
                                                                                            name='reasonTextArea'
                                                                                            placeholder={t("write_cancel_reason")}
                                                                                            className='reasonTextArea my-4'
                                                                                            required
                                                                                        />
                                                                                    </div>
                                                                                    <div className='d-flex justify-content-end mt-4'>
                                                                                        <button type='submit' className='returnSubmitBtn'>
                                                                                            {t("cancel_order")}
                                                                                        </button>
                                                                                    </div>
                                                                                </form>
                                                                            </Modal.Body>
                                                                        </Modal>
                                                                        : null}
                                                                    {showReturnModal[index] ?
                                                                        <Modal
                                                                            size='md'
                                                                            show={showReturnModal[index]}
                                                                            centered
                                                                            // onHide={() => setShowReturnModal(false)}
                                                                            onHide={() => setShowReturnModal(prevState => {
                                                                                const newState = [...prevState];
                                                                                newState[index] = false;
                                                                                return newState;
                                                                            })}
                                                                            backdrop="static"
                                                                        >
                                                                            <Modal.Header className='d-flex justify-content-between returnProductModalHeader'>
                                                                                <h5 className='title'>{t("return_order_item")}</h5>
                                                                                <AiOutlineCloseCircle className='cursorPointer' size={28} fill='black' onClick={() => setShowReturnModal(prevState => {
                                                                                    const newState = [...prevState];
                                                                                    newState[index] = false;
                                                                                    return newState;
                                                                                })} />
                                                                            </Modal.Header>
                                                                            <Modal.Body className='returnProductModalBody'>
                                                                                <form onSubmit={(e) => {
                                                                                    e.preventDefault();
                                                                                    // if (!returnRef.current.value.trim()) {
                                                                                    //     toast.error(t('please_type_return_reason'));
                                                                                    //     return; // Don't proceed further if the textarea is empty
                                                                                    // }
                                                                                    handleUpdateStatus(item?.id, 8, returnRef.current.value);
                                                                                }}>
                                                                                    <div className='d-flex flex-column justify-content-center'>
                                                                                        <label htmlFor='reasonTextArea' className='my-3 reasonLabel'>
                                                                                            {t("return_reason")}
                                                                                        </label>
                                                                                        <textarea
                                                                                            ref={returnRef}
                                                                                            id="reasonTextArea"
                                                                                            rows={8}
                                                                                            name='reasonTextArea'
                                                                                            placeholder={t("write_return_reason")}
                                                                                            className='reasonTextArea my-4'
                                                                                            required
                                                                                        />
                                                                                    </div>
                                                                                    <div className='d-flex justify-content-end mt-4'>
                                                                                        <button type='submit' className='returnSubmitBtn'>
                                                                                            {t("request_a_return")}
                                                                                        </button>
                                                                                    </div>
                                                                                </form>
                                                                            </Modal.Body>
                                                                        </Modal>
                                                                        : null}
                                                                </React.Fragment>

                                                            );

                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-xl-3">
                                <div className="order-info">
                                    <div className="order-status-container order-info-container">
                                        <div className="container-heading">
                                            <span>
                                                {t('order')}
                                            </span>
                                            <span className="order-id">
                                                #{orderData?.id}

                                            </span>
                                        </div>
                                        <div className="status-body">

                                            <div className="order-status-details">
                                                <div className="order-status">
                                                    {`${t('order')} ${orderStatus}`}
                                                </div>
                                                <div className="order-success">
                                                    {`${t('your_order_has_been')} ${orderStatus} ${t('successfully')}`}
                                                </div>
                                                <div className="status-date">

                                                    {orderData?.status?.length > 0 && new Date(orderData?.status.reverse()[0].reverse()[0]).toLocaleDateString()}
                                                    <p>{orderData?.status?.length > 0 && convertToAMPM(new Date(orderData?.status.reverse()[0].reverse()[0]))}</p>
                                                </div>
                                            </div>
                                            <div className="payment-status">
                                            </div>
                                        </div>
                                    </div>
                                    {orderData?.order_note !== "" ? <div className='order-info-container order-note-container'>
                                        <div className='container-heading'>
                                            <span>
                                                {t("order_note_title")}
                                            </span>
                                        </div>
                                        <div className='order-note-details'>
                                            {orderData?.order_note.split('\r\n').map((line, index) => (
                                                <React.Fragment key={index}>
                                                    {line}
                                                    <br />
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div> : null}
                                    <div className="order-info-container order-delivery-info">
                                        <div className="container-heading">
                                            <span>
                                                {t('delivery_information')}
                                            </span>
                                        </div>
                                        <div className="container-body">
                                            <div className="address-container">
                                                <span className='address-heading'>
                                                    {t('delivery_to')}
                                                </span>
                                                <span className='address-info'>
                                                    {orderData?.order_address}
                                                </span>
                                            </div>

                                            <div className="contact-container">
                                                <span>
                                                    {`${orderData?.country} - ${orderData?.mobile}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="order-info-container order-billing-container">
                                        <div className="container-heading">
                                            <span>
                                                {t('billing_details')}
                                            </span>
                                        </div>
                                        <div className="container-body">
                                            <div className="payment-info">
                                                <div>
                                                    <span>
                                                        {t('payment_method')}
                                                    </span>
                                                    <span>
                                                        {orderData?.payment_method}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span>
                                                        {t('transaction_id')}
                                                    </span>
                                                    <span>
                                                        {orderData?.transaction_id}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span>
                                                        {t('delivery_charge')}
                                                    </span>
                                                    <span>
                                                        {setting.setting?.currency}{orderData?.delivery_charge}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span>
                                                        {t('sub_total')}
                                                    </span>
                                                    <span>
                                                        {setting.setting?.currency}{orderData?.total}
                                                    </span>
                                                </div>
                                                {orderData?.promo_discount ? <div>
                                                    <span>
                                                        {t('promo_code_discount')}
                                                    </span>
                                                    <span>
                                                        - {setting.setting?.currency}{orderData?.promo_discount}
                                                    </span>
                                                </div> : null}
                                                {orderData?.wallet_balance ? <div>
                                                    <span>
                                                        {t('wallet_balance_used')}
                                                    </span>
                                                    <span>
                                                        - {setting.setting?.currency}{orderData?.wallet_balance}
                                                    </span>
                                                </div> : null}
                                                {orderData?.discount ?
                                                    <div>
                                                        <span>
                                                            {t('discount')}
                                                        </span>
                                                        <span>
                                                            {setting.setting?.currency}{orderData?.discount}
                                                        </span>
                                                    </div>
                                                    : <></>}
                                            </div>
                                            <div className="order-total">

                                                <div>
                                                    <span>
                                                        {t('total')}
                                                    </span>
                                                    <span>
                                                        {setting?.setting?.currency}{orderData?.final_total}
                                                    </span>
                                                </div>
                                            </div>
                                            {orderData?.active_status === "6" ?
                                                <div className="button-container">
                                                    <button className="btn" onClick={() => {
                                                        getInvoice(orderData?.id);
                                                    }}>
                                                        {t('get_invoice')}
                                                    </button>
                                                </div>
                                                : <></>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <RateProductModal product_id={ratingProductId} showPdtRatingModal={showPdtRatingModal} setShowPdtRatingModal={setShowPdtRatingModal} />
                    <UpdateRatingModal product_id={ratingProductId} showModal={showRatingEditModal} setShowModal={setShowRatingEditModal} ratingId={editRatingId} setRatingId={setEditRatingId} />
                </section>
                :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>
            }
        </>
    );
});

export default OrderDetails;
