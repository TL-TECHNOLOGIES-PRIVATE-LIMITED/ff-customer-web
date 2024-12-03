import React, { useEffect, useRef, useState } from 'react';
import './order.css';
import api from '../../api/api';
import { FaRupeeSign } from "react-icons/fa";
import { AiOutlineCloseCircle } from 'react-icons/ai';
import Loader from '../loader/Loader';
import Pagination from 'react-js-pagination';
import No_Orders from '../../utils/zero-state-screens/No_Orders.svg';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ProgressBar, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OrderTracker from './OrderTracker';
import { formatDate, formatTime } from '../../utils/formatDate';
import ReceivedSVG from "../../utils/Icons/statusIcons/status_icon_received.svg";
import PendingPaymentSVG from "../../utils/Icons/statusIcons/status_icon_awaiting_payment.svg";
import ProcessedSVG from "../../utils/Icons/statusIcons/status_icon_process.svg";
import ShippedSVG from "../../utils/Icons/statusIcons/status_icon_shipped.svg";
import OutforDeliverySVG from "../../utils/Icons/statusIcons/status_icon_out_for_delivery.svg";
import DeliveredSVG from "../../utils/Icons/statusIcons/status_icon_delivered.svg";
import CancelledSVG from "../../utils/Icons/statusIcons/status_icon_cancel.svg";
import ReturnedSVG from "../../utils/Icons/statusIcons/status_icon_returned.svg";
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';
import LiveTrackingModal from '../live-tracking-modal/LiveTrackingModal';

const Order = () => {


    const [NoOrders, setNoOrders] = useState(false);
    const [totalActiveOrders, setTotalActiveOrders] = useState(null);
    const [totalPrevOrders, setTotalPrevOrders] = useState(null);
    const [ActiveOrders, setActiveOrders] = useState([]);
    const [PrevOrders, setPrevOrders] = useState([]);
    const [offset, setoffset] = useState(0);
    const [currPage, setcurrPage] = useState(1);
    const [isLoader, setisLoader] = useState(false);
    const [showTracker, setShowTracker] = useState(false);
    const [showLiveLocationModal, setShowLiveLocationModal] = useState(false)
    const [element, setElement] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null)

    const componentRef = useRef();
    const total_orders_per_page = 10;

    const navigate = useNavigate();

    const setting = useSelector(state => state.setting);
    const user = useSelector(state => state.user);
    const [orderId, setOrderId] = useState(null);
    const [isNetworkError, setIsNetworkError] = useState(false);

    const fetchOrders = async () => {
        await api.getOrders(user?.jwtToken, total_orders_per_page, offset)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setisLoader(false);
                    setActiveOrders(result.data);
                    setTotalActiveOrders(result.total);
                }
                else if (result.message === "No orders found") {
                    setisLoader(false);
                    setNoOrders(true);
                }
            }).catch(err => {
                const isNoInternet = ValidateNoInternet(err);
                if (isNoInternet) {
                    setIsNetworkError(true);
                }
            });

        await api.getOrders(user?.jwtToken, total_orders_per_page, offset, 0)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setisLoader(false);
                    setPrevOrders(result.data);
                    setTotalPrevOrders(result.total);
                }
                else if (result.message === "No orders found") {
                    setisLoader(false);
                    setNoOrders(true);
                }
            });
    };

    useEffect(() => {
        setisLoader(true);
        fetchOrders();
    }, [offset]);

    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_orders_per_page - total_orders_per_page);
    };


    const getInvoice = async (Oid) => {
        setisLoader(true);
        let postData = new FormData();
        postData.append('order_id', Oid);
        axios({
            url: `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_SUBURL}/invoice_download`,
            method: 'post',
            responseType: 'blob',
            /*responseType: 'application/pdf',*/
            data: postData,
            headers: {
                Authorization: `Bearer ${user?.jwtToken}`
            }
        }).then(response => {


            var fileURL = window.URL.createObjectURL(new Blob([response.data]));
            var fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'Invoice-No:' + Oid + '.pdf');
            document.body.appendChild(fileLink);
            fileLink.click();
            setisLoader(false);


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

    const convertToAMPM = (transactionDate) => {
        const dateTimeObj = new Date(transactionDate);
        const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        const timeInAMPMFormat = dateTimeObj.toLocaleString('en-US', options);
        return timeInAMPMFormat;
    };

    const closeModalRef = useRef();
    const getOrderStatus = (pid) => {
        for (let i = 0; i < ActiveOrders.length; i++) {
            const element = ActiveOrders[i];
            closeModalRef.current.click();
        }
    };

    const setHtml = (ID, status = 0) => {
        if (!status) {
            ActiveOrders.map((obj, index) => {
                if (obj.id === Number(ID)) {
                    setElement(obj);

                }
            });
        } else {
            PrevOrders?.map((obj, index) => {
                if (obj.id === Number(ID)) {
                    setElement(obj);

                }
            });
        }
    };
    const handlePrint = () => {
        if (closeModalRef.current) {
            closeModalRef.current.click();
            toast.success('Invoice Downloaded Successfully');
        }
    };
    const { t } = useTranslation();

    const getImageofOrderStatus = (status) => {
        return (
            <>
                {
                    status == 1 ? <img src={PendingPaymentSVG} className='p-3' alt='PendingPaymentSVG' /> :
                        status == 2 ? <img src={ReceivedSVG} className='p-3' alt='ReceivedSVG' /> :
                            status == 3 ? <img src={ProcessedSVG} className='p-3' alt='ProcessedSVG' /> :
                                status == 4 ? <img src={ShippedSVG} className='p-3' alt='ShippedSVG' /> :
                                    status == 5 ? <img src={OutforDeliverySVG} className='p-3' alt='OutforDeliverySVG' /> :
                                        status == 6 ? <img src={DeliveredSVG} className='p-3' alt='DeliveredSVG' /> :
                                            status == 7 ? <img src={CancelledSVG} className='p-3' alt='CancelledSVG' /> :
                                                status == 8 ? <img src={ReturnedSVG} className='p-3' alt='ReturnedSVG' /> : null
                }
            </>
        );
    };

    const getStatus = (flag) => {
        return (
            <>
                {Number(flag[0]) == 1 ? t("paymentPending") :
                    Number(flag[0]) == 2 ? t("received") :
                        Number(flag[0]) == 3 ? t("processed") :
                            Number(flag[0]) == 4 ? t("shipped") :
                                Number(flag[0]) == 5 ? t("outForDelivery") :
                                    Number(flag[0]) == 6 ? t("delivered") :
                                        Number(flag[0]) == 7 ? t("cancelled") :
                                            Number(flag[0]) == 8 ? t("returned") : null}
            </>);
    };

    const handleLiveTrackOrder = (e, order) => {
        if (order?.active_status !== "5") {
            setHtml(e.target.value);
            getOrderStatus(e.target.value);
        } else {
            setShowLiveLocationModal(true);
            setSelectedOrder(order)
        }
    }

    return (
        <>
            {!isNetworkError ?
                <div className='order-list'>
                    <div className='heading'>
                        {t("all_orders")}
                    </div>

                    {isLoader ?
                        <div className='my-5'><Loader width='100%' height='500px' /></div>
                        : <>

                            <Tabs
                                defaultActiveKey={"active"}
                                className='orders-tab'
                                fill
                            >
                                <Tab
                                    eventKey={'active'}
                                    title={t('active_orders')}
                                    className='active-orders'
                                >
                                    <>
                                        {ActiveOrders && ActiveOrders.length === 0
                                            ? <div className='d-flex align-items-center p-4 no-orders'>
                                                <img src={No_Orders} className='no-data-img' alt='no-orders'></img>
                                                <p>{t("no_order")}</p>
                                            </div>
                                            :
                                            <table className='order-list-table'>
                                                <thead>
                                                    <tr>
                                                        <th>{t("order")}</th>
                                                        <th>{t("products") + " " + t("name")}</th>
                                                        <th>{t("date")}</th>
                                                        <th>{t("total")}</th>
                                                        <th>{t("action")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ActiveOrders && ActiveOrders.map((order, index) => (
                                                        <tr key={order.order_id} className={index === ActiveOrders.length - 1 ? 'last-column' : ''}>
                                                            <th>{`#${order.order_id} `}</th>
                                                            <th className='product-name d-table-cell verticall-center flex-column justify-content-center'>{order.items.map((item, ind) => (
                                                                <div className="column-container" key={ind}>
                                                                    <span>{item.product_name}</span>
                                                                    {ind < order.items.length - 1 && <span>,</span>}
                                                                </div>
                                                            ))}
                                                            </th>
                                                            <th>

                                                                {order.created_at.substring(0, 10)}
                                                                <p>{convertToAMPM(order.created_at)}</p>
                                                            </th>
                                                            <th className='total'>
                                                                <FaRupeeSign fontSize={'1.7rem'} /> {order.final_total}
                                                            </th>
                                                            <th className='button-container'>
                                                                <button type='button' id={`track - ${order.order_id} `} data-bs-toggle={order.active_status !== "5" ? "modal" : undefined}
                                                                    data-bs-target={order.active_status !== "5" ? "#trackModal" : undefined} className='track' value={order.order_id}
                                                                    onClick={(e) => {
                                                                        handleLiveTrackOrder(e, order)

                                                                    }}>{t("track_order")}</button>

                                                                <button onClick={() => {
                                                                    navigate(`${order.order_id}`);
                                                                }} className='Invoice'>{t('view_details')}</button>
                                                            </th>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        }
                                        {ActiveOrders && ActiveOrders.length !== 0 ?
                                            <Pagination
                                                itemClass='orderPagination'
                                                activePage={currPage}
                                                itemsCountPerPage={total_orders_per_page}
                                                totalItemsCount={totalActiveOrders}
                                                pageRangeDisplayed={5}
                                                onChange={handlePageChange.bind(this)}
                                            />
                                            : null}
                                    </>
                                </Tab>
                                <Tab
                                    eventKey={'prev'}
                                    title={t('previous_orders')}
                                    className='prev-orders'
                                >
                                    <>
                                        {PrevOrders && PrevOrders.length === 0
                                            ? <div className='d-flex align-items-center p-4 no-orders'>
                                                <img src={No_Orders} alt='no-orders'></img>
                                                <p>{t("no_order")}</p>
                                            </div>
                                            :
                                            <table className='order-list-table'>
                                                <thead>
                                                    <tr>
                                                        <th>{t("order")}</th>
                                                        <th>{t("products") + " " + t("name")}</th>
                                                        <th>{t("date")}</th>
                                                        <th>{t("total")}</th>
                                                        <th>{t("action")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {PrevOrders && PrevOrders.map((order, index) => (
                                                        <tr key={order?.order_id} className={index === PrevOrders.length - 1 ? 'last-column' : ''}>
                                                            <th>{`#${order.order_id} `}</th>
                                                            <th className='product-name d-table-cell verticall-center flex-column justify-content-center'>{order.items.map((item, ind) => (
                                                                <div key={item?.id} className="column-container">
                                                                    <span key={ind}>{item.product_name}{ind < order.items.length - 1 && <span>,</span>}</span>
                                                                </div>
                                                            ))}
                                                            </th>
                                                            <th>
                                                                {order.created_at.substring(0, 10)}
                                                                <p>{convertToAMPM(order.created_at)}</p>
                                                            </th>
                                                            <th className='total'>
                                                                <FaRupeeSign fontSize={'1.7rem'} /> {order.final_total}
                                                            </th>
                                                            <th className='button-container'>

                                                                <button type='button' id={`track - ${order.order_id} `} data-bs-toggle="modal" data-bs-target="#trackModal" className='track' value={order.order_id}
                                                                    onClick={(e) => { setHtml(e.target.value, 1); getOrderStatus(e.target.value); }}>{t("track_order")}</button>
                                                                <button onClick={() => {
                                                                    navigate(`${order.order_id}`);
                                                                }} className='Invoice'>{t('view_details')}</button>
                                                            </th>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        }
                                        {PrevOrders && PrevOrders.length !== 0 ?
                                            <Pagination
                                                itemClass='orderPagination'
                                                activePage={currPage}
                                                itemsCountPerPage={total_orders_per_page}
                                                totalItemsCount={totalPrevOrders}
                                                pageRangeDisplayed={5}
                                                onChange={handlePageChange.bind(this)}
                                            />
                                            : null}
                                    </>
                                </Tab>
                            </Tabs>
                        </>
                    }






                    <div id="track">
                        <div className="modal fade new-track" id="trackModal" aria-labelledby="TrackModalLabel" aria-hidden="true">
                            <div className='modal-dialog'>
                                <div className="modal-content" style={{ borderRadius: "10px", maxWidth: "100%", padding: "30px 15px", zIndex: -2 }}>
                                    <div id="mainContentTrack">
                                        <section className="track" id="printMe">
                                            <div className="d-flex justify-content-between align-items-center mx-5">
                                                <h5 className="page-header">{setting.setting?.app_name}</h5>
                                                <h5 className="page-header">{t("mobile")}{element && element.mobile}</h5>
                                                <button type="button" className="closeBtn" data-bs-dismiss="modal" aria-label="Close" ref={closeModalRef} style={{ width: '30px' }}><AiOutlineCloseCircle size={26} /></button>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="d-flex flex-column mx-5 justify-content-around position-relative">
                                                    <div className="d-flex my-4 align-items-center">
                                                    </div>
                                                    <div className='d-flex flex-column my-4 align-items-center'>
                                                        {element?.status?.map((flag, index) => (
                                                            <div key={index} className="d-flex gap-5 align-items-center orderStatusContainer">
                                                                <div className="my-4 track-order-icon">
                                                                    {getImageofOrderStatus(Number(flag[0]))}
                                                                </div>
                                                                {(index < (element?.status?.length - 1)) ? <ProgressBar className='orderProgressBar' now={100} /> : null}
                                                                <span className='orderStatusText'>
                                                                    Your order has been {getStatus(flag)} on {formatDate(flag[1])} {formatTime(flag[1])}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>



                                        </section>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <OrderTracker show={showTracker} setShow={setShowTracker} />
                </div>
                :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>
            }
            {showLiveLocationModal &&
                <LiveTrackingModal showLiveLocationModal={showLiveLocationModal} setShowLiveLocationModal={setShowLiveLocationModal} selectedOrder={selectedOrder} />
            }
        </>

    );
};

export default Order;
