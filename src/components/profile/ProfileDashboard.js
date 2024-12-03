import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import './profile.css';
import coverImg from '../../utils/cover-img.jpg';
import { FaUserCircle, FaListAlt, FaHome, FaEdit, FaWallet } from 'react-icons/fa';
import { GoChecklist } from 'react-icons/go';
import { IoIosArrowForward, IoMdLogOut } from 'react-icons/io';
import { AiFillDelete, AiOutlineCloseCircle } from 'react-icons/ai';
import { toast } from 'react-toastify';
import Order from '../order/Order';
import Address from '../address/Address';
import Transaction from '../transaction/Transaction';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { removelocalstorageOTP } from '../../utils/manageLocalStorage';
import api from '../../api/api';
import { useTranslation } from 'react-i18next';
import FirebaseData from '../../utils/firebase/FirebaseData';
import { logoutAuth, setCurrentUser } from "../../model/reducer/authReducer";
import { setFilterBrands, setFilterCategory, setFilterSearch, setFilterSection } from "../../model/reducer/productFilterReducer";
import WalletTransaction from '../wallet-transaction/WalletTransaction';
import { PiWallet } from "react-icons/pi";
import { setCartProducts, setCartSubTotal, setIsGuest } from '../../model/reducer/cartReducer';


const ProfileDashboard = (props) => {

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { firebase } = FirebaseData();

    const setting = useSelector((state) => state.setting);
    const user = useSelector(state => (state.user));
    const closeCanvas = useRef(null);


    const [profileClick, setprofileClick] = useState(true);
    const [orderClick, setorderClick] = useState(false);
    const [selectedButton, setSelectedButton] = useState(location?.pathname?.split("/")?.[2] || 'profile');
    const [addressClick, setaddressClick] = useState(false);
    const [transactionClick, settransactionClick] = useState(false);
    const [walletTransactionClick, setWalletTransactionClick] = useState(false);
    const [username, setusername] = useState(user.user && user.user.name);
    const [useremail, setuseremail] = useState(user.user && user.user.email);
    const [selectedFile, setselectedFile] = useState();
    const [isupdating, setisupdating] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(user.user && user.user.mobile)

    // Store original values
    const [originalUsername, setOriginalUsername] = useState(user.user.name);
    const [originalEmail, setOriginalEmail] = useState(user.user.email);

    const checkIfChanged = () => {
        if (
            username !== originalUsername ||
            useremail !== originalEmail ||
            selectedFile !== null
        ) {
            setIsChanged(true);
        } else {
            setIsChanged(false);
        }
    };

    const handleButtonClick = (buttonName) => {
        setSelectedButton(buttonName);
        // Add your existing button click logic here
    };


    useEffect(() => {
        if (user.status === 'loading') {
            navigate('/');
        }

        if (location.pathname === "/profile/orders") {
            setprofileClick(false);
            setorderClick(true);
            setWalletTransactionClick(false);
            setaddressClick(false);
            settransactionClick(false);
        } else if (location.pathname === "/profile/transactions") {
            settransactionClick(true);
            setprofileClick(false);
            setWalletTransactionClick(false);
            setaddressClick(false);
            setorderClick(false);
        } else if (location.pathname === "/profile/wallet-transaction") {
            setWalletTransactionClick(true);
            setprofileClick(false);
            setorderClick(false);
            setaddressClick(false);
            settransactionClick(false);
        } else if (location.pathname === "/profile/address") {
            setaddressClick(true);
            setprofileClick(false);
            setWalletTransactionClick(false);
            settransactionClick(false);
            setorderClick(false);
        }

    }, [user]);


    useEffect(() => {
        checkIfChanged();
    }, [username, useremail, selectedFile]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setIsOpen(true);
        }, 500);
        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    const getCurrentUser = (token) => {
        api.getUser(token)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setCurrentUser({ data: result.user }));
                    // dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: result.user });
                    setisupdating(false);
                }
            });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (selectedFile) {

            if (selectedFile.type === 'image/png' || selectedFile.type === 'image/jpg' || selectedFile.type === 'image/jpeg') {
                setisupdating(true);
                if (user?.jwtToken !== "") {
                    await api.edit_profile(username, useremail,
                        "", selectedFile, user?.jwtToken)
                        .then(response => response.json())
                        .then(result => {
                            if (result.status === 1) {
                                toast.success(result?.message)
                                getCurrentUser(user?.jwtToken);
                                setIsChanged(false);
                            }
                            else {
                                toast.error(result.message);
                                setisupdating(false);
                            }
                        }).catch((error) => {
                            toast.error(error);
                        });

                }
            } else {
                toast.error("File Type Not Allowed");
            }
        } else {
            setisupdating(true);
            if (user?.jwtToken !== "") {

                await api.edit_profile(username, useremail, phoneNumber, selectedFile, user?.jwtToken)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            toast.success(result?.message)
                            getCurrentUser(user?.jwtToken);
                            setIsChanged(false);
                        }
                        else {
                            toast.error(result.message);
                            setisupdating(false);
                        }
                    }).catch((error) => {
                        toast.error(error);
                    });
            } else {
                navigate("/")
                toast.error("Something went wrong")

            }
        }
        // setuseremail("")
        // setselectedFile()
        // setusername("")
    };


    const handleLogout = () => {

        confirmAlert({
            title: t('logout_title'),
            message: t('logout_message'),
            buttons: [
                {
                    label: t("Ok"),
                    onClick: async () => {
                        await api.logout(user?.jwtToken).then(response => response.json())
                            .then(result => {
                                if (result.status === 1) {
                                    removelocalstorageOTP();
                                    dispatch(setFilterBrands({ data: [] }));
                                    dispatch(setFilterCategory({ data: null }));
                                    dispatch(setFilterSearch({ data: null }));
                                    dispatch(setFilterSection({ data: null }));
                                    dispatch(setCartProducts({ data: [] }));
                                    dispatch(setCartSubTotal({ data: 0 }));
                                    dispatch(logoutAuth({ data: null }));
                                    dispatch(setIsGuest({ data: true }));
                                    toast.success("You're Successfully Logged Out");
                                    navigate('/');
                                }
                                else {
                                    toast.info(result.message);
                                }
                            });

                    }
                },
                {
                    label: t('Cancel'),
                    onClick: () => { }
                }
            ]
        });


    };
    // console.log(user?.authId);

    const handleDeleteAcount = () => {

        confirmAlert({
            title: t('DeleteUserAccount'),
            message: t(`delete_user_message`),
            buttons: [
                {
                    label: t('Ok'),
                    onClick: async () => {

                        await api.deleteAccount(user?.jwtToken, user?.authId).then(response => response.json())
                            .then(result => {
                                if (result.status === 1 && setting?.setting?.firebase_authentication == 1) {
                                    let user = firebase.auth().currentUser;
                                    user.delete().then((response) => {
                                    });
                                    dispatch(setFilterBrands({ data: [] }));
                                    dispatch(setFilterCategory({ data: null }));
                                    dispatch(setFilterSearch({ data: null }));
                                    dispatch(setFilterSection({ data: null }));
                                    dispatch(setCartProducts({ data: [] }));
                                    dispatch(setCartSubTotal({ data: 0 }));
                                    dispatch(logoutAuth({ data: null }));
                                    dispatch(setIsGuest({ data: true }));
                                    toast.info("You're Account is Succesfully Deleted!!");
                                    navigate('/');
                                } else if (result.status === 1 && setting?.setting?.custom_sms_gateway_otp_based == 1) {
                                    dispatch(setFilterBrands({ data: [] }));
                                    dispatch(setFilterCategory({ data: null }));
                                    dispatch(setFilterSearch({ data: null }));
                                    dispatch(setFilterSection({ data: null }));
                                    dispatch(setCartProducts({ data: [] }));
                                    dispatch(setCartSubTotal({ data: 0 }));
                                    dispatch(logoutAuth({ data: null }));
                                    dispatch(setIsGuest({ data: true }));
                                    toast.info("You're Account is Succesfully Deleted!!");
                                    navigate('/');
                                }
                                else {
                                    toast.info(result.message);
                                }
                            });

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

    const profileNav = () => {

        return (
            <>
                <div className='image-container d-flex align-items-center mt-4 walletContainer gap-3' >
                    <PiWallet size={35} fill={'var(--secondary-color)'} />
                    {t("Wallet Balance")}
                    <p style={{ color: 'var(--secondary-color' }} className='mb-0'>
                        {setting?.setting?.currency}
                        {parseFloat(user?.user?.balance).toFixed(setting?.setting && setting?.setting?.decimal_point)}
                    </p>
                </div>



                <div className="navigation-container">

                    {/* Profile */}
                    <button type='button' className={`navigation-container-button ${selectedButton === 'profile' ? 'activeTab' : ''}`} onClick={() => {
                        setprofileClick(true);
                        navigate('/profile');
                        setaddressClick(false);
                        setorderClick(false);
                        settransactionClick(false);
                        setWalletTransactionClick(false);
                        closeCanvas.current.click();
                        handleButtonClick('profile');
                    }}>

                        <span>
                            <FaUserCircle size={35} className='mx-3' fill={'var(--secondary-color)'} />
                            {t("edit_profile")}
                        </span>
                        <IoIosArrowForward className="profile-navigate-arrow" />
                    </button>

                    {/* Orders */}
                    <button type='button' className={`navigation-container-button ${selectedButton === 'orders' ? 'activeTab' : ''}`} onClick={() => {
                        setprofileClick(false);
                        setaddressClick(false);
                        setorderClick(true);
                        settransactionClick(false);
                        setWalletTransactionClick(false);
                        setisupdating(false);
                        navigate('/profile/orders');
                        closeCanvas.current.click();
                        handleButtonClick('orders');

                    }}>
                        <span >
                            <FaListAlt size={35} className='mx-3' fill={'var(--secondary-color)'} />
                            {t("all_orders")}
                        </span>
                        <IoIosArrowForward className="profile-navigate-arrow" />
                    </button>

                    {/* Address  */}
                    <button type='button' className={`navigation-container-button ${selectedButton === 'address' ? 'activeTab' : ''}`} onClick={() => {
                        setprofileClick(false);
                        navigate('/profile/address');
                        setaddressClick(true);
                        setorderClick(false);
                        settransactionClick(false);
                        setWalletTransactionClick(false);
                        setisupdating(false);
                        closeCanvas.current.click();
                        handleButtonClick('address');

                    }}>
                        <span >
                            <FaHome size={35} className='mx-3' fill={'var(--secondary-color)'} />
                            {t("manage_address")}
                        </span>
                        <IoIosArrowForward className="profile-navigate-arrow" />
                    </button>

                    {/* Transaction_History */}
                    <button type='button' className={`navigation-container-button ${selectedButton === 'transactions' ? 'activeTab' : ''}`} onClick={() => {
                        navigate('/profile/transactions');
                        setprofileClick(false);
                        setaddressClick(false);
                        setorderClick(false);
                        settransactionClick(true);
                        setWalletTransactionClick(false);
                        setisupdating(false);
                        closeCanvas.current.click();
                        handleButtonClick('transactions');
                        // navigate('/profile/address')

                        if (window.innerWidth < 768) document.getElementsByClassName('sidebar')[0].classList.toggle('active');
                    }} >
                        <span>
                            <GoChecklist size={35} className='mx-3' fill={'var(--secondary-color)'} />
                            {t("transaction_history")}
                        </span>
                        <IoIosArrowForward className="profile-navigate-arrow" />
                    </button>

                    {/* Wallet_History */}
                    <button type='button' className={`navigation-container-button ${selectedButton === 'wallet-transaction' ? 'activeTab' : ''}`} onClick={() => {
                        navigate('/profile/wallet-transaction');
                        setprofileClick(false);
                        setaddressClick(false);
                        setorderClick(false);
                        settransactionClick(false);
                        setWalletTransactionClick(true);
                        setisupdating(false);
                        closeCanvas.current.click();
                        handleButtonClick('wallet-transaction');

                        if (window.innerWidth < 768) document.getElementsByClassName('sidebar')[0].classList.toggle('active');
                    }} >
                        <span>
                            <FaWallet size={30} className='mx-3' fill={'var(--secondary-color)'} />
                            {t("wallet_history")}
                        </span>
                        <IoIosArrowForward className="profile-navigate-arrow" />
                    </button>

                    {/* Logout */}
                    <button type='button' className='navigation-container-button no-hover' onClick={handleLogout}>
                        <span>
                            <IoMdLogOut size={35} className='mx-3' fill={'var(--secondary-color)'} />
                            {t("logout")}
                        </span>
                        <IoIosArrowForward className="profile-navigate-arrow" />
                    </button>

                    {/* Delete_Account  */}
                    <button type='button' className='navigation-container-button ' onClick={handleDeleteAcount}>
                        <span>
                            <AiFillDelete size={35} className='mx-3' fill={'var(--secondary-color)'} />
                            {t("delete_account")}
                        </span>
                        <IoIosArrowForward className="profile-navigate-arrow" />
                    </button>
                </div>

            </>
        );
    };
    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };
    return (
        <>
            {user.status === 'loading'
                ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <section id='profile'>
                        <div className={`hide-desktop offcanvas offcanvas-start ${isOpen ? "show" : ""} `} tabIndex="-1" id="profilenavoffcanvasExample" aria-labelledby="profilenavoffcanvasExampleLabel" data-bs-backdrop="false">
                            <div className="canvas-header">
                                <div className='site-brand'>
                                    <img src={setting.setting && setting.setting.web_settings.web_logo} height="50px" alt="logo"></img>
                                </div>

                                <button type="button" ref={closeCanvas} className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => {
                                    document.getElementsByClassName('profile-account')[0]?.classList.remove('active');
                                    setIsOpen(false);
                                }}><AiOutlineCloseCircle fill='black' /></button>
                            </div>
                            <div className='sidebar'>
                                {profileNav()}
                            </div>
                        </div>

                        <div className='cover'>
                            <img src={coverImg} className='img-fluid' alt="cover"></img>
                        </div>
                        <div className='container py-5'>
                            <div className='content-container row'>

                                <div className='sidebar hide-mobile-screen col-md-2 col-3'>

                                    {profileNav()}


                                </div>
                                <div className='table-content col-md-9 col-sm-12   '>
                                    <h4>{t("profile_info")}</h4>


                                    {profileClick
                                        ?// <ProfileContent isupdating={isupdating} setisupdating={setisupdating} />
                                        <>
                                            <div className='d-flex flex-column'>
                                                <div className='heading'>
                                                    {t("edit_profile")}
                                                </div>
                                                <div className='actual-content my-5'>
                                                    {user.status === 'loading'
                                                        ? (
                                                            <div className="d-flex justify-content-center">
                                                                <div className="spinner-border" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        )
                                                        : (
                                                            <div className='row'>
                                                                <div className="basicInfo-container col-md-6">
                                                                    <div className="image-container">
                                                                        {selectedFile ?
                                                                            <>
                                                                                <img src={URL?.createObjectURL(selectedFile)} alt='userProfileImage' />
                                                                                <div className="button-container-badge">
                                                                                    <label htmlFor="file">
                                                                                        <input
                                                                                            type='file'
                                                                                            onChange={(e) => {
                                                                                                setselectedFile(e.target.files[0]);
                                                                                            }}
                                                                                            className="badge-img"
                                                                                        />
                                                                                        <FaEdit size={25} fill='var(--secondary-color)' />
                                                                                    </label>
                                                                                </div>
                                                                            </>
                                                                            :
                                                                            <>
                                                                                <img
                                                                                    onError={placeHolderImage}
                                                                                    src={user.user && user.user.profile}
                                                                                    alt='logo'
                                                                                />
                                                                                <div className="button-container-badge">
                                                                                    <label htmlFor="file">
                                                                                        <input
                                                                                            type='file'
                                                                                            onChange={(e) => {
                                                                                                setselectedFile(e.target.files[0]);
                                                                                            }}
                                                                                            className="badge-img"
                                                                                        />
                                                                                        <FaEdit size={25} fill='var(--secondary-color)' />
                                                                                    </label>
                                                                                </div>
                                                                            </>
                                                                        }
                                                                    </div>
                                                                    <p className='userName'>{user.user.name.split(' ')[0]}</p>
                                                                    <span className='userEmail'>{user.user.email}</span>

                                                                </div>
                                                                <form onSubmit={handleUpdateUser} className='col-md-6'>
                                                                    <div className='inputs-container'>
                                                                        <input
                                                                            type='text'
                                                                            placeholder='user name'
                                                                            value={username}
                                                                            onChange={(e) => {
                                                                                setusername(e.target.value);
                                                                            }}
                                                                            disabled={user.authType == "google"}
                                                                            required
                                                                        />
                                                                        <input
                                                                            type='email'
                                                                            placeholder='email address'
                                                                            value={useremail}
                                                                            onChange={(e) => {
                                                                                setuseremail(e.target.value);
                                                                            }}
                                                                            disabled={user.authType == "google"}
                                                                            required
                                                                        />
                                                                        <input
                                                                            type='tel'
                                                                            placeholder='mobile number'
                                                                            value={phoneNumber}
                                                                            required
                                                                            className={user.authType == "phone" ? "inactive-input" : "active-input"}
                                                                            disabled={user.authType == "phone"}
                                                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                                                        />
                                                                        {/* accept={'image/*'} */}
                                                                        <input
                                                                            type="file"
                                                                            id="file"
                                                                            name='file'
                                                                            onChange={(e) => { setselectedFile(e.target.files[0]); }}
                                                                            accept='image/png, image/jpeg, image/jpg'
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type='submit'
                                                                        disabled={!isChanged || isupdating}
                                                                    >
                                                                        {t("update_profile")}
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        )}
                                                </div>
                                            </div></>
                                        : null}

                                    {orderClick
                                        ? <Order />
                                        : null}

                                    {transactionClick
                                        ? <Transaction />
                                        : null}

                                    {addressClick
                                        ? <Address />
                                        : null}

                                    {walletTransactionClick
                                        ? <WalletTransaction />
                                        : null}


                                </div>
                            </div>

                        </div>

                    </section>
                )}
        </>
    );
};

export default ProfileDashboard;
