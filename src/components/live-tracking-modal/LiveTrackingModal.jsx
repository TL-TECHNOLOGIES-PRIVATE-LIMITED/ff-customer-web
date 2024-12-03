import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import "./livetrackingModal.css"
import { useTranslation } from 'react-i18next';
import { BiChevronRight, BiGift, BiPhoneCall, BiStoreAlt } from 'react-icons/bi';
import { IoLocationOutline } from "react-icons/io5";
import {
    GoogleMap, Marker, useJsApiLoader, Polyline, OverlayView
} from '@react-google-maps/api';
import * as newApi from '../../api/apiCollection';


const LiveTrackingModal = ({ showLiveLocationModal, setShowLiveLocationModal, selectedOrder }) => {
    const { t } = useTranslation();
    const [map, setMap] = useState(null);
    const [riderLocation, setRiderLocation] = useState();
    const [userLocation, setUserLocation] = useState({
        lat: null,
        lng: null,
    });

    const [showOverlay, setShowOverlay] = useState(false);
    const fetchLocation = async () => {
        try {
            const res = await newApi.liveOrderTracking({ orderId: selectedOrder?.id });

            if (res.status == 0) {
                setShowOverlay(true);
            } else {
                const latitude = parseFloat(res?.data?.latitude);
                const longitude = parseFloat(res?.data?.longitude);
                setRiderLocation({ lat: latitude, lng: longitude })
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    useEffect(() => {
        if (showLiveLocationModal) {
            fetchLocation(selectedOrder?.id);
        }
    }, [selectedOrder])

    useEffect(() => {
        let interval;
        if (showLiveLocationModal) {
            interval = setInterval(() => {
                if (showLiveLocationModal) {
                    fetchLocation(selectedOrder?.id);
                }
            }, 15000);
        }
        return () => {
            clearInterval(interval);
        };
    }, [showLiveLocationModal, fetchLocation]);

    useEffect(() => {
        if (selectedOrder?.latitude && selectedOrder?.longitude) {
            setUserLocation({
                lat: parseFloat(selectedOrder?.latitude),
                lng: parseFloat(selectedOrder?.longitude)
            });
        }
    }, [selectedOrder]);

    const handleClose = () => setShowLiveLocationModal(false);
    const containerStyle = {
        width: '735px',
        height: '410px'
    };

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_MAP_API
    })

    const GOOGLE_MAPS_LIBRARIES = ["places", "geometry"];

    const onLoad = React.useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(riderLocation && riderLocation);
        map.fitBounds(bounds);
        setMap(map)
    }, [])

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])

    const polylineOptions = {
        strokeColor: "#FF0000",
        strokeOpacity: 0.5,
        strokeWeight: 5,
        icons: [
            {
                icon: {
                    path: "M 0,-1 0,1",
                    strokeOpacity: 1,
                    scale: 4,
                },
                offset: "0",
                repeat: "20px",
            },
        ],
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12) || 12;
        return `${day}, ${month}, ${year}, ${formattedHours}:${minutes} ${ampm}`;
    }
    // console.log("selected order", selectedOrder)
    return (
        <>
            <Modal show={showLiveLocationModal} onHide={handleClose} size='lg' centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("livetracking")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='d-flex live-location-container flex-column  flex'>
                        <div className='col-12 location  '>
                            {isLoaded ?
                                <div style={{ position: 'relative' }}>

                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={riderLocation && riderLocation}
                                        zoom={7}
                                        onLoad={onLoad}
                                        onUnmount={onUnmount}
                                    >
                                        {riderLocation && userLocation && (
                                            <>
                                                <Marker position={riderLocation}></Marker>
                                                <Marker position={userLocation}></Marker>
                                            </>
                                        )}
                                        <></>
                                        {riderLocation && userLocation && (
                                            <Polyline path={[riderLocation, userLocation]} options={polylineOptions} />
                                        )}
                                    </GoogleMap>

                                    {showOverlay && (
                                        <div className="overlay-fullscreen">
                                            <div className="overlay-content">
                                                <p>Unable to load tracking data</p>
                                            </div>
                                        </div>
                                    )}

                                </div> : null}
                        </div>
                        <div className='col-12   order-detail pt-3 pt-md-0 pt-lg-0'>

                            <div className='d-flex justify-content-between order-detail-header'>
                                <h1>Order Detail</h1>
                                <h3 className='d-flex align-items-center'>Order #{selectedOrder?.id} <BiChevronRight /></h3>
                            </div>
                            <div className='order-status d-flex align-items-center '>
                                <div className='gift-pack-svg'>
                                    <IoLocationOutline size={30} />
                                </div>
                                <div className=''>

                                    <h3>{t("deliveryAddress")}</h3>
                                    <p className='m-0'>{selectedOrder?.address}</p>
                                </div>

                            </div>
                            {/* <div className='delivery-status d-flex flex-column'>
                                <p className='delivery-header'>Deliery Detail</p>
                                <div className='delivery-detail d-flex'>
                                    <div className='sender col-6 d-flex gap-3 align-items-center'>
                                        <div className='delivery-svg'>
                                            <BiStoreAlt size={24} />
                                        </div>
                                        <div>
                                            <p>Delivery from</p>
                                            <h3>Stark's store</h3>
                                        </div>
                                    </div>
                                    <div className='receiver col-6 d-flex gap-3 align-items-center'>
                                        <div className='delivery-svg'>
                                            <IoLocationOutline size={24} />
                                        </div>
                                        <div>
                                            <p>Delivery To</p>
                                            <h3>{selectedOrder?.user_name}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

                            {selectedOrder?.delivery_boy_name == null ? null : <div className='partner-detail d-flex flex-column'>
                                <p>Delivery Partner Details </p>
                                <div className='d-flex justify-content-between partner-container align-items-center'>
                                    <div className='d-flex align-items-center gap-4'>
                                        <div className='partner-prsnl-detail'>
                                            <h2>{selectedOrder?.delivery_boy_name}</h2>
                                            <p>{selectedOrder?.delivery_boy_mobile}</p>
                                        </div>
                                    </div>
                                    <div className='partner-phone-svg'> <a href={`tel:${selectedOrder?.delivery_boy_mobile ? selectedOrder?.delivery_boy_mobile : ""}`}>
                                        <BiPhoneCall size={25} color='white' />
                                    </a></div>
                                </div>
                            </div>}


                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default LiveTrackingModal