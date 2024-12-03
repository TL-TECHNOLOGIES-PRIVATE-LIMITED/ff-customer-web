import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import './address.css';
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { GrAddCircle } from 'react-icons/gr';
import NewAddress from './NewAddress';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';
import { useTranslation } from 'react-i18next';
import { confirmAlert } from 'react-confirm-alert';
import { setAddress, setSelectedAddress } from "../../model/reducer/addressReducer";
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';

const Address = () => {

    const dispatch = useDispatch();

    const [isAddressSelected, setIsAddressSelected] = useState(false);
    const [show, setShow] = useState(false);
    const [isLoader, setisLoader] = useState(false);
    const address = useSelector(state => state.address);
    const user = useSelector(state => (state.user));
    const [isNetworkError, setIsNetworkError] = useState(false);
    const fetchAddress = (token) => {
        api.getAddress(token)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setAddress({ data: result.data }));
                    if (result.data.find((element) => element.is_default == 1)) {
                        dispatch(setSelectedAddress({ data: result.data.find((element) => element.is_default == 1) }));
                    }
                } else {
                    dispatch(setAddress({ data: null }));
                    setisLoader(false);
                }
                setisLoader(false);
            }).catch(err => {
                const isNoInternet = ValidateNoInternet(err);
                if (isNoInternet) {
                    setIsNetworkError(true);
                }
            });
    };



    useEffect(() => {
        if (user?.jwtToken !== "" && user.user !== null) {
            fetchAddress(user?.jwtToken);
        }
    }, [user]);



    const deleteAddress = (address_id) => {
        confirmAlert({
            title: t('delete_address'),
            message: t(`delete_address_message`),
            buttons: [
                {
                    label: t('Ok'),
                    onClick: async () => {

                        setisLoader(true);
                        api.deleteAddress(user?.jwtToken, address_id)
                            .then(response => response.json())
                            .then(result => {
                                if (result.status === 1) {
                                    toast.success('Succesfully Deleted Address!');
                                    fetchAddress(user?.jwtToken);
                                }
                            })
                            .catch(error => console.log(error));

                    }
                },
                {
                    label: t('Cancel'),
                    onClick: () => { }
                }
            ]
        });


    };

    const { t } = useTranslation();

    return (
        <>

            {!isNetworkError ?
                <div className='address-wrapper'>
                    {address.status !== "fulfill" || isLoader
                        ? (
                            <Loader width='100%' height='300px' />
                        )
                        : (
                            <>
                                {address.address && address.address.map((address, index) => (
                                    <div key={index} className='address-component'>
                                        <div className='d-flex justify-content-between'>
                                            <div className='d-flex gap-2 align-items-center justify'>
                                                <input className="form-input" type="radio" name="AddressRadio" id={`AddressRadioId${index}`} defaultChecked={address?.is_default === 1 ? true : index === 0} onChange={() => {
                                                    dispatch(setSelectedAddress({ data: address }));
                                                }} />
                                                <label className="form-check-label" htmlFor={`AddressRadioId${index}`}>
                                                    <span>{address.name}</span>

                                                    <span className='home mx-3'>{address.type}</span>
                                                </label>
                                            </div>

                                            <div className='d-flex gap-2'>
                                                <button type='button' className='edit' onClick={() => {
                                                    setisLoader(true);
                                                    dispatch(setSelectedAddress({ data: address }));
                                                    setIsAddressSelected(true);
                                                    setShow(true);
                                                    setisLoader(false);

                                                }}>
                                                    <FiEdit fill='var(--secondary-color)' size={24} />
                                                </button>

                                                <button type='button' className='remove' onClick={() => deleteAddress(address.id)}>
                                                    <RiDeleteBinLine fill='red' size={24} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className='address'>
                                            {address.address}, {address.landmark}, {address.area}, {address.city}, {address.state}, {address.pincode}-{address.country}
                                        </div>

                                        <div className='mobile'>
                                            {address.mobile}
                                        </div>
                                    </div>
                                ))}

                                <div className='address-component new-address'>
                                    <button type='button' onClick={() => {
                                        dispatch(setSelectedAddress({ data: null }));
                                        setIsAddressSelected(false);
                                        setShow(true);
                                    }}>
                                        <GrAddCircle fontSize='3rem' /> {t("add_new_address")}
                                    </button>
                                </div>
                                <NewAddress setIsAddressSelected={setIsAddressSelected} isAddressSelected={isAddressSelected} show={show} setshow={setShow} isLoader={isLoader} setisLoader={setisLoader} />
                            </>
                        )}

                </div>
                :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>
            }
        </>

    );
};

export default Address;
