import React, { useState, useEffect, useRef } from 'react';
import './header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import * as newApi from '../../api/apiCollection';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import { Menu, Modal } from 'antd';
import "../location/location.css";
import { DownOutlined, SmileOutlined } from '@ant-design/icons';

import { Dropdown as AntdDropdown, Space } from 'antd';

// reducres import
import { setCity } from "../../model/reducer/locationReducer";
import { setPaymentSetting } from '../../model/reducer/settingReducer';
import { setLanguage, setLanguageList } from "../../model/reducer/languageReducer";
import { setFilterSearch, setFilterCategory, setProductBySearch, setFilterBrands, setFilterSection, clearAllFilter } from "../../model/reducer/productFilterReducer";
import { setCSSMode } from '../../model/reducer/cssmodeReducer';
import { setCart, setCartProducts, setCartSubTotal, setIsGuest, setTotalCartValue } from '../../model/reducer/cartReducer';


// icons import
import { BsMoon, BsShopWindow } from 'react-icons/bs';
import { BiBell, BiBookmarkHeart, BiCartAlt, BiMoneyWithdraw, BiUserCircle, BiWallet } from 'react-icons/bi';
import { MdSearch, MdGTranslate, MdNotificationsActive, MdOutlineWbSunny, MdOutlinePhoneInTalk, MdPhoneInTalk } from "react-icons/md";
import { IoNotificationsOutline, IoHeartOutline, IoCartOutline, IoPersonOutline, IoContrast, IoCloseCircle, IoLocationOutline, IoWalletOutline } from 'react-icons/io5';
import { IoMdArrowDropdown, IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { GoLocation } from 'react-icons/go';
import { FiMenu, FiFilter, FiUser } from 'react-icons/fi';
import { AiOutlineClose, AiOutlineCloseCircle } from 'react-icons/ai';
import { FaFacebookSquare, FaInstagramSquare, FaTwitterSquare, FaLinkedin, FaSearch, FaPhoneVolume, FaRegUserCircle, FaShoppingCart } from "react-icons/fa";
import { BsCart2, BsThreeDotsVertical } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import { FaMapLocationDot } from "react-icons/fa6";
import { GrTransaction } from "react-icons/gr";
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { confirmAlert } from 'react-confirm-alert';
import { BiMoon, BiSun } from "react-icons/bi";

// components imports
import Location from '../location/Location';
import Login from '../login/Login';
import Cart from '../cart/Cart';
import { label } from 'yet-another-react-lightbox';
import { logoutAuth } from '../../model/reducer/authReducer';
import { removelocalstorageOTP } from '../../utils/manageLocalStorage';




const Header = () => {
    const closeSidebarRef = useRef();
    const searchNavTrigger = useRef();
    const { t } = useTranslation();
    const curr_url = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const shop = useSelector(state => state.shop);
    const city = useSelector(state => (state.city));
    const cssmode = useSelector(state => (state.cssmode));
    const user = useSelector(state => (state.user));
    const cart = useSelector(state => (state.cart));
    const favorite = useSelector(state => (state.favourite));
    const setting = useSelector(state => (state.setting));
    const languages = useSelector((state) => (state.language));
    const category = shop && shop?.shop?.categories;
    const filter = useSelector(state => state.productFilter);


    const [isSticky, setIsSticky] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [bodyScroll, setBodyScroll] = useState(false);
    const [locModal, setLocModal] = useState(false);
    const [mobileNavActKey, setMobileNavActKey] = useState(null);
    const [isLocationPresent, setisLocationPresent] = useState(false);
    const [totalNotification, settotalNotification] = useState(null);
    const [isDesktopView, setIsDesktopView] = useState(window.innerWidth > 768);
    const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedCategoryId, setSelectedCategoryId] = useState("")
    const [query, setQuery] = useState("")
    const [typingTimeout, setTypingTimeout] = useState(null);

    const openCanvasModal = () => {
        handleModal();
        closeSidebarRef.current.click();
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

    const items = [
        {
            key: '1',
            label: (
                <span onClick={() => navigate("/profile")} className="custom-dropdown-item">
                    <BiUserCircle size={22} />
                    {t("editProfile")}
                </span>
            ),
        },
        {
            key: '2',
            label: (
                <span onClick={() => navigate("/profile/orders")} className="custom-dropdown-item">
                    <BiCartAlt size={22} />
                    {t("orders")}
                </span>
            )
        },
        {
            key: '3',
            label: (
                <span onClick={() => navigate("/wishlist")} className="custom-dropdown-item">
                    <BiBookmarkHeart size={22} />
                    {t("wishlist")}
                </span>
            )
        },
        {
            key: '4',
            label: (
                <span onClick={() => navigate("/notification")} className="custom-dropdown-item">
                    <BiBell size={22} />
                    {t("notification")}
                </span>
            )
        },
        {
            key: '5',
            label: (
                <span className="custom-dropdown-item" onClick={() => navigate("/profile/address")}>
                    <IoLocationOutline size={22} />
                    {t("myAddress")}
                </span>
            )
        },
        {
            key: '6',
            label: (
                <span className="custom-dropdown-item" onClick={() => navigate("/profile/wallet-transaction")}>
                    <BiWallet size={22} />
                    {t("walletBalance")}
                </span>
            )
        },
        {
            key: '7',
            label: (
                <span onClick={() => navigate("/profile/transactions")} className="custom-dropdown-item">
                    <BiMoneyWithdraw size={22} />
                    {t("myTransaction")}
                </span>
            )
        },
        {
            key: '8',
            label: (
                <span className="custom-dropdown-item" onClick={handleLogout}>
                    <RiLogoutCircleRLine size={20} />
                    {t("logout")}
                </span>
            )
        },
    ];



    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const result = await newApi.getCart({ latitude: city?.city?.latitude, longitude: city?.city?.longitude })
                if (result.status == 1) {
                    const productsData = result?.data?.cart?.map((product) => {
                        return {
                            product_id: product?.product_id,
                            product_variant_id: product?.product_variant_id,
                            qty: product?.qty
                        };
                    });
                    dispatch(setCartProducts({ data: productsData }));
                    dispatch(setCartSubTotal({ data: result?.data?.sub_total }))

                } else if (result.message == "No item(s) found in users cart") {
                    dispatch(setCartProducts({ data: [] }));
                }
            } catch (err) {
                console.log(err?.message);
            }
        };
        if (user?.jwtToken) {
            fetchCartData()
        }
    }, [user?.jwtToken])

    // cart?.cartSubTotal, cart?.guestCartTotal
    useEffect(() => {
        if (bodyScroll) {
            document.body.style.overflow = 'auto';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';
        }
    }, [bodyScroll]);


    const handleModal = () => {
        setLocModal(true);
        setBodyScroll(true);
    };

    useEffect(() => {
        if (curr_url.pathname != "/products") {
            dispatch(setFilterSearch({ data: null }));
        }
    }, [curr_url]);

    useEffect(() => {
        const fetchCity = async () => {
            try {
                if (setting.setting?.default_city && city.city == null) {
                    setisLocationPresent(true);
                    const latitude = parseFloat(setting.setting.default_city?.latitude)
                    const longitude = parseFloat(setting.setting.default_city?.longitude)
                    const response = await newApi.getCity({ latitude: latitude, longitude: longitude })
                    if (response.status === 1) {
                        dispatch(setCity({ data: response.data }));
                    } else {
                        setLocModal(true);
                    }
                    dispatch(setCity({ data: response.data }));
                }
                else if (setting?.setting && setting.setting?.default_city == null && city?.city == null) {
                    setLocModal(true);
                }
            } catch (error) {
                console.log("error", error)
            }
        }
        fetchCity()
    }, [setting]);


    useEffect(() => {
        // if (languages?.available_languages === null) {
        api.getSystemLanguage(0, 0)
            .then((response) => response.json())
            .then((result) => {
                dispatch(setLanguageList({ data: result.data }));
            });
        // }
        if ((curr_url?.pathname == "/") || (curr_url?.pathname == "/profile/wallet-transaction") || (curr_url?.pathname == "/checkout")) {
            fetchPaymentSetting();
        }
        // dispatch(setFilterSearch({ data: null }));
        handleResize();
        window.addEventListener('resize', handleResize);

        // Cleanup the event listener when the component unmounts
        const handleClickOutside = (event) => {
            if (closeSidebarRef.current && !closeSidebarRef.current.contains(event.target) && !event.target.closest(".lang-mode-utils")) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const fetchPaymentSetting = async () => {
        await api.getPaymentSettings(user?.jwtToken)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setPaymentSetting({ data: JSON.parse(atob(result.data)) }));
                }
            })
            .catch(error => console.log(error));
    };

    const handleChangeLanguage = (id) => {
        api.getSystemLanguage(id, 0)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    document.documentElement.dir = result.data.type;
                    dispatch(setLanguage({ data: result.data }));
                }
            });
    };

    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };

    const handleResize = () => {
        setIsDesktopView(window.innerWidth > 768);
    };

    // console.log(isDesktopView)
    const handleMobileNavActKey = (key) => {
        setMobileNavActKey(key == mobileNavActKey ? null : key);
    };

    const handleThemeChange = (theme) => {
        document.body.setAttribute("data-bs-theme", theme);
        dispatch(setCSSMode({ data: theme }));
    };

    //updated category filter

    // const handleCatChange = (category) => {
    //     setSelectedCategory(category?.name)
    //     setSelectedCategoryId(category?.id)
    // }

    const handleCatChange = (category) => {
        if (category === "All categories") {
            setSelectedCategory("All categories");
            setSelectedCategoryId(null);
            dispatch(setFilterCategory({ data: null }));
            
            // Clear search if there is any
            if (filter?.search) {
                dispatch(setFilterSearch({ data: "" }));
                setQuery("");
            }
        } else {
            setSelectedCategory(category?.name);
            setSelectedCategoryId(category?.id);
            dispatch(setFilterCategory({ data: category?.id }));
            
            // Only navigate to products if we're not already there
            if (curr_url.pathname !== "/products") {
                navigate("/products");
            }
        }
        
        // Trigger search with new category if there's a search query
        if (filter?.search) {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            const timeout = setTimeout(() => {
                handleSearch();
            }, 500);
            
            setTypingTimeout(timeout);
        }
    };
    const handleSearch = async () => {
        try {
            const response = await newApi.productByFilter({ latitude: city?.city?.latitude, longitude: city?.city?.longitude, filters: filter })
            dispatch(setProductBySearch({ data: response?.data }))
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleQueryChange = (e) => {
        const value = e.target.value;

        if (value.trim() === "") {
            dispatch(setFilterSearch({ data: "" }))
            // dispatch(setFilterCategory({ data: value }))
            clearTimeout(typingTimeout)
            return
        }
        setQuery(e.target.value);
        dispatch(setFilterSearch({ data: e.target.value }))
        dispatch(setFilterCategory({ data: selectedCategoryId }))

        // Clear the previous timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Set a new timeout for 5 seconds
        const timeout = setTimeout(() => {
            handleSearch(e.target.value);
        }, 2000);

        // Store the timeout ID
        setTypingTimeout(timeout);
    };
    // console.log("setting", setting.setting.web_settings?.placeholder_image)
    return (
        <>
            {/* sidebar */}
            <div className="hide-desktop offcanvas offcanvas-start" tabIndex="-1" id="sidebaroffcanvasExample" aria-labelledby="sidebaroffcanvasExampleLabel">
                <div className='site-scroll ps'>

                    <div className="canvas-header">
                        <div className='site-brand'>
                            <img src={setting.setting && setting.setting.web_settings.web_logo} className='off-canvas-logo' alt="logo"></img>
                        </div>
                        <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeSidebarRef} onClick={() => setIsOpen(false)}><IoCloseCircle fill='white' size={100} /></button>
                    </div>
                    <div className="canvas-main">
                        <div className={isDesktopView ? "site-location " : "site-location d-none"}>
                            <button whiletap={{ scale: 0.8 }} type='buton' onClick={openCanvasModal} >
                                <div className='d-flex flex-row gap-2'>
                                    <div className='icon location p-1 m-auto'>
                                        <GoLocation fill='black' />
                                    </div>
                                    <div className='d-flex flex-column flex-grow-1'>
                                        <span className='location-description'>{t("deliver_to")} <IoMdArrowDropdown /></span>
                                        <span className='current-location'>{isLocationPresent
                                            ? (
                                                <>
                                                    {city.status === 'fulfill'
                                                        ? city.city.formatted_address
                                                        : (
                                                            <div className="d-flex justify-content-center">
                                                                <div className="spinner-border" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                </>)
                                            : t("select_location")
                                        }</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <nav className='canvas-menu canvas-primary vertical'>
                            <ul id='menu-menu-1' className='menu'>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click();
                                        navigate('/');
                                    }}>{t("home")}</button>
                                </li>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click();
                                        navigate('/about');
                                    }}>{t('about_us')}</button>
                                </li>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click();
                                        navigate('/contact');
                                    }}>{t('contact_us')}</button>
                                </li>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click();
                                        navigate('/faq');
                                    }}>{t('faq')}</button>
                                </li>
                            </ul>



                            <div className='lang-mode-utils'>
                                <div className='language-container' >

                                    {languages.available_languages?.length > 1 ? <div> <MdGTranslate size={24} />
                                        <Dropdown >
                                            <Dropdown.Toggle variant='Secondary' >
                                                {languages.current_language && languages.current_language.name}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {languages.available_languages && languages.available_languages.map((language, index) => {
                                                    return (
                                                        <Dropdown.Item key={index} onClick={() => {
                                                            handleChangeLanguage(language.id);
                                                        }}>{language.name}</Dropdown.Item>
                                                    );
                                                })}
                                            </Dropdown.Menu>
                                        </Dropdown></div> : <button className='language-btn-mobile'><MdGTranslate size={20} className='me-2' />
                                        {languages.current_language && languages.current_language.name}</button>}


                                </div>

                            </div>
                        </nav>
                    </div>
                </div>

            </div>




            {/* header */}
            < header className='site-header  desktop-shadow-disable mobile-shadow-enable bg-white  mobile-nav-enable border-bottom' >


                {/* top header */}
                <div div className={`header-top d-none d-md-block border-bottom ${(cssmode.cssmode === "dark") ? "dark-header-top" : ''}`
                }>
                    <div className="container">
                        <div className={`row justify-content-between`}>
                            <div className='col-md-6 d-flex justify-content-start align-items-center social-icons-cotainer'>
                                <span>{t('follow_us')}:

                                    {setting?.setting && setting?.setting?.social_media?.map((icon, index) => {
                                        return (
                                            <div className='socical-icons'>
                                                <a key={index} href={icon.link} className=''>
                                                    <i className={` fab ${icon.icon} fa-lg  `} style={{ color: "#fff" }}>
                                                    </i>
                                                </a>
                                            </div>

                                        );
                                    })}
                                </span>
                            </div>
                            <div className='col-md-6 d-flex justify-content-end'>

                                <div className='d-flex align-items-center px-2 '>
                                    <Dropdown className='themeDropdown'>
                                        <Dropdown.Toggle>
                                            <IoContrast size={20} className='me-2' />
                                            {t(cssmode.cssmode)}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {cssmode?.cssmode === "dark" ? <Dropdown.Item key={"dark"} onClick={() => handleThemeChange("light")}>Light</Dropdown.Item> : null}
                                            {cssmode?.cssmode === "light" ? <Dropdown.Item key={"light"} onClick={() => handleThemeChange("dark")}>Dark</Dropdown.Item> : null}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                                <div className='language-container' >
                                    {languages.available_languages?.length > 1 ? <Dropdown>
                                        <Dropdown.Toggle>
                                            <MdGTranslate size={20} className='me-2' />
                                            {languages.current_language && languages.current_language.name}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {languages.available_languages && languages.available_languages.map((language, index) => {
                                                return (
                                                    <Dropdown.Item key={index} onClick={() => { handleChangeLanguage(language.id); }}>{language.name}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown> : <button className='language-btn'><MdGTranslate size={20} className='me-2' />
                                        {languages.current_language && languages.current_language.name}</button>}


                                </div>
                            </div>
                        </div>
                    </div>
                </div >


                {/* center header */}
                < div className={isSticky ? "sticky header-main  w-100" : "header-main  w-100"} >
                    <div className="container">
                        <div className='d-flex row-reverse justify-content-between align-items-center top-header'>

                            <div className='d-flex w-auto align-items-center justify-content-start column-left '>

                                <div className='header-buttons hide-desktop' >

                                    <button className='header-canvas button-item ' type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebaroffcanvasExample" aria-controls="sidebaroffcanvasExample">
                                        <div className='button-menu'>
                                            <FiMenu />
                                        </div>
                                    </button>
                                </div>


                                <Link to='/' className='site-brand hide-mobile'>
                                    <img src={setting.setting && setting.setting.web_settings.web_logo} alt="logo" className='desktop-logo ' />
                                    {/* <img src={setting.setting && setting.setting.web_settings.web_logo} alt="logo" className='mobile-logo hide-desktop' /> */}
                                </Link>





                            </div>

                            <div className='hide-desktop'>
                                <Link to='/' className='site-brand'>
                                    <img src={setting.setting && setting.setting.web_settings.web_logo} alt="logo" className='desktop-logo ' />
                                    {/* <img src={setting.setting && setting.setting.web_settings.web_logo} alt="logo" className='mobile-logo hide-desktop' /> */}
                                </Link>
                            </div>
                            <div className='header-nav-list d-none d-xl-block'>
                                <ul>
                                    <li
                                        className={curr_url.pathname == "/" ? "active-link" : ""}
                                        onClick={() => navigate('/')}
                                    > <a>Home</a></li>
                                    <li
                                        className={curr_url.pathname == "/about" ? "active-link" : ""}
                                        onClick={() => navigate('/about')}
                                    ><a>About us</a></li>
                                    <li
                                        className={curr_url.pathname == "/faq" ? "active-link" : ""}
                                        onClick={() => navigate('/faq')}
                                    ><a>FAQ's</a></li>
                                    <li
                                        className={curr_url.pathname == "/contact" ? "active-link" : ""}
                                        onClick={() => navigate('/contact')}
                                    > <a>Contact Us</a></li>
                                </ul>
                            </div>

                            <div className='header-btn-containers'>
                                {/* {user?.jwtToken == "" ? :} */}
                                <div className='me-5' onClick={() => setIsCartSidebarOpen(true)} role='button' data-bs-toggle="offcanvas" data-bs-target="#cartoffcanvasExample" aria-controls="cartoffcanvasExample">
                                    <span className='cart-btn'  >
                                        <IoCartOutline size={24} />
                                        {
                                            cart.isGuest == true ? <p className={cart?.guestCart
                                                ?.length != 0 ? "d-flex" : "d-none"}> {cart?.guestCart
                                                    ?.length != 0 ? cart?.guestCart
                                                    ?.length : null}</p> :
                                                <p className={cart?.cartProducts?.length != 0 ? "d-flex" : "d-none"}> {cart?.cartProducts?.length != 0 ? cart?.cartProducts?.length : null}</p>
                                        }

                                    </span>
                                    <span className='cart-value'>
                                        <span>Your Cart</span>
                                        <h4>{setting.setting && setting.setting.currency}{
                                            cart.isGuest == true ? cart?.guestCartTotal?.toFixed(2) :
                                                cart?.cartSubTotal?.toFixed(2)
                                        }</h4>
                                    </span>
                                </div>
                                <div>
                                    {user?.jwtToken == "" ? <div role='button' onClick={() => setShowModal(true)}>
                                        <span className='cart-btn'>
                                            <FiUser size={24} />

                                        </span>
                                        <div className=''>
                                            <h4>{t("login")}</h4>
                                        </div>
                                    </div> :
                                        <div>

                                            <span className='cart-btn'>
                                                <FiUser size={24} />

                                            </span>

                                            <div className='profile-section'>

                                                <AntdDropdown
                                                    menu={{
                                                        items,
                                                    }}
                                                >
                                                    <a onClick={(e) => e.preventDefault()}>
                                                        <Space>
                                                            Profile
                                                            <DownOutlined />
                                                        </Space>
                                                    </a>
                                                </AntdDropdown>

                                            </div>
                                        </div>}
                                </div>



                            </div>

                            <div className=' row header-icons'>
                                <div className='col-6'>
                                    {cssmode?.cssmode === "dark" ? <span><BiMoon size={20} onClick={() => handleThemeChange("light")} /></span> : <span onClick={() => handleThemeChange("dark")}><BiSun size={20} /></span>}

                                </div>
                                <div className='col-6'>
                                    <div className='position-relative'>
                                        <span className='responsive-cart-btn ' onClick={() => setIsCartSidebarOpen(true)}>
                                            <BsCart2 />
                                            {
                                                cart.isGuest == true ? <p className={cart?.guestCart
                                                    ?.length != 0 ? "d-flex" : "d-none"}> {cart?.guestCart
                                                        ?.length != 0 ? cart?.guestCart
                                                        ?.length : null}</p> :
                                                    <p className={cart?.cartProducts?.length != 0 ? "d-flex" : "d-none"}> {cart?.cartProducts?.length != 0 ? cart?.cartProducts?.length : null}</p>
                                            }

                                        </span>
                                    </div>

                                </div>

                                {/* <span className='user-profile-btn'>
                                    <CiUser />
                                </span> */}

                                {/* <BsThreeDotsVertical />  */}
                            </div>

                        </div >
                        {/* Bottom header */}
                        <div className='d-flex row-reverse justify-content-lg-between justify-content-start bottom-header '>

                            <div className='d-flex w-auto align-items-center justify-content-start col-md-1  column-left location'
                                onClick={() => setLocModal(true)}
                                role='button'
                            >
                                <span className='location-btn'>
                                    <IoLocationOutline size={24} />
                                </span>
                                <span className='location-value'>
                                    <span>{t("deliver_to")}</span>
                                    <h4>{city.status === 'fulfill'
                                        ? city.city.formatted_address
                                        : (
                                            t("select_location")
                                        )}</h4>
                                </span>
                            </div>


                            <div className={`header-search ${mobileNavActKey == 2 ? "active " : ""} d-md-none`}>
                                <div className='header-search-content'>

                                    <Dropdown >
                                        <Dropdown.Toggle>
                                            {selectedCategory ? selectedCategory : `All categories`}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu >
                                            <Dropdown.Item
                                                onClick={() => handleCatChange("All categories")}>All categories</Dropdown.Item>
                                            {category?.length > 0 &&
                                                category?.map((cat) => {

                                                    return (
                                                        <Dropdown.Item
                                                            key={cat.id}
                                                            onClick={() => handleCatChange(cat)}
                                                        >{cat.name}</Dropdown.Item>
                                                    )
                                                })
                                            }
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <input type='text' placeholder='I am looking for...' value={filter?.search} onChange={handleQueryChange} />
                                    <button className='mobile-search-btn' onClick={() => {
                                        dispatch(setProductBySearch({ data: "" }))
                                        navigate("/products")
                                        setMobileNavActKey(1)
                                    }}><FaSearch size={20} />Search</button>

                                </div>
                                {filter?.search_product?.length > 0 ? <div className='d-flex flex-column  mobile-search-result'>

                                    {filter?.search_product?.map((prdct) => {
                                        return (
                                            <Link to={`/product/${prdct?.slug}`} onClick={() => {
                                                setQuery("")
                                                dispatch(setProductBySearch({ data: "" }))
                                                setMobileNavActKey(null)
                                            }}> {prdct?.name}</Link>
                                        )
                                    })}
                                </div> : null}
                            </div>

                            <div className={` col-lg-6 col-md-8 col-sm-8  column-left d-flex flex-column position-relative `}>
                                <div className='d-flex align-items-center justify-content-start col-12 column-left search '>
                                    <Dropdown>
                                        <Dropdown.Toggle>
                                            {selectedCategory ? selectedCategory : `All categories`}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu >
                                            <Dropdown.Item
                                                onClick={() => handleCatChange("All categories")}>All categories</Dropdown.Item>
                                            {category?.length > 0 &&
                                                category?.map((cat) => {

                                                    return (
                                                        <Dropdown.Item
                                                            key={cat.id}
                                                            onClick={() => handleCatChange(cat)}
                                                        >{cat.name}</Dropdown.Item>
                                                    )
                                                })
                                            }
                                        </Dropdown.Menu>
                                    </Dropdown>


                                    <input type='text' placeholder='I am looking for...' value={filter?.search} onChange={handleQueryChange} />
                                    <button className='search-btn' onClick={() => {
                                        dispatch(setProductBySearch({ data: "" }))
                                        navigate("/products")
                                    }}><FaSearch size={20} />Search</button>
                                </div>
                                {(filter?.search_product?.length > 0 && curr_url.pathname !== '/products' && query?.length > 2) ? <div className='col-lg-6 col-md-8 col-sm-8  column-left d-flex flex-column search-result '>

                                    {filter?.search_product?.map((prdct) => {
                                        return (
                                            <Link to={`/product/${prdct?.slug}`} onClick={() => {
                                                setQuery("")
                                                dispatch(setProductBySearch({ data: "" }))

                                            }}> {prdct?.name}</Link>
                                        )
                                    })}
                                </div> : null}

                            </div>
                            {setting?.setting?.support_number ? <div className='contact d-none d-xl-block'>
                                <a href={`tel:${setting?.setting !== null ? setting?.setting?.support_number : "number"}`}> <MdPhoneInTalk size={22} />  {setting.setting !== null ? setting.setting.support_number : "number"}</a>
                            </div> : null}

                        </div>
                    </div >
                </div >



                {/* Mobile bottom Nav */}
                < nav className='header-mobile-nav' >
                    <div className='mobile-nav-wrapper'>
                        <ul>
                            <li className='menu-item'>
                                <Link to='/products' className={`shop ${curr_url.pathname === '/products' && mobileNavActKey == 1 ? 'active' : ''}`} onClick={() => {
                                    handleMobileNavActKey(1);
                                }}>
                                    <div>
                                        <BsShopWindow fill='black' />
                                    </div>
                                    <span>{t("shop")}</span>
                                </Link>
                            </li>

                            <li className='menu-item '>
                                <button type='button' className={`search ${mobileNavActKey == 2 ? "active" : ""}`} ref={searchNavTrigger} onClick={() => {
                                    handleMobileNavActKey(2);
                                    searchNavTrigger.current.focus();
                                }}>
                                    <div>
                                        <MdSearch />
                                    </div>
                                    <span>{t("search")}</span>
                                </button>

                            </li>

                            {curr_url.pathname === '/products' ? (
                                <li className='menu-item'>
                                    <button type='button' className={`filter ${mobileNavActKey == 3 ? "active" : ""}`} data-bs-toggle="offcanvas" data-bs-target="#filteroffcanvasExample" aria-controls="filteroffcanvasExample" onClick={() => {
                                        handleMobileNavActKey(3);
                                    }}>
                                        <div>
                                            <FiFilter />
                                        </div>
                                        <span>{t("filter")}</span>
                                    </button>
                                </li>
                            ) : ""}

                            <li className='menu-item'>
                                {city.city === null || user?.jwtToken === ""
                                    ? <button type='button' className={`wishlist ${mobileNavActKey == 4 ? "active" : ""}`} onClick={() => {

                                        if (user?.jwtToken === "") {
                                            toast.error(t("required_login_message_for_wishlist"));
                                        }
                                        else if (city.city === null) {
                                            toast.error("Please Select you delivery location first!");
                                        }
                                        else {
                                            handleMobileNavActKey(4);
                                            navigate("/wishlist");
                                        }


                                    }}>
                                        <div>
                                            <IoHeartOutline />

                                        </div>
                                        <span>{t("wishList")}</span>
                                    </button>
                                    : <button type='button' className={`wishlist ${mobileNavActKey == 4 ? "active" : ""}`} onClick={() => {

                                        if (user?.jwtToken === "") {
                                            toast.error(t("required_login_message_for_cartRedirect"));
                                        }
                                        else if (city.city === null) {
                                            toast.error("Please Select you delivery location first!");
                                        }
                                        else {
                                            handleMobileNavActKey(4);
                                            navigate("/wishlist");
                                        }
                                    }
                                    }>
                                        {/*  data-bs-toggle="offcanvas" data-bs-target="#favoriteoffcanvasExample" aria-controls="favoriteoffcanvasExample" */}
                                        <div>
                                            <IoHeartOutline />

                                            {favorite.favorite && favorite.favorite.status !== 0 ?
                                                <span className="translate-middle badge rounded-pill fs-5" style={{ background: "var(--secondary-color)", borderRadius: "50%", color: "#fff", top: "1px", right: "-9px" }}>
                                                    {favorite.favorite && favorite.favorite.status !== 0 && favorite.favorite.total}
                                                    <span className="visually-hidden">unread messages</span>
                                                </span>
                                                : null}
                                        </div>
                                        <span>{t("wishList")}</span>
                                    </button>}

                            </li>

                            {curr_url.pathname === '/profile' ? (
                                <li className='menu-item'>
                                    <button type='button' className={`profile-account user-profile ${curr_url?.pathname.includes("/profile") ? "active" : ""}`} onClick={() => {
                                        handleMobileNavActKey(5);
                                        document.getElementsByClassName('profile-account')[0].classList.toggle('active');
                                        document.getElementsByClassName('wishlist')[0].classList.remove('active');
                                        if (curr_url.pathname === '/products') {
                                            document.getElementsByClassName('filter')[0].classList.remove('active');
                                        }
                                        if (curr_url.pathname !== '/products') {
                                            document.getElementsByClassName('shop')[0].classList.remove('active');
                                        }
                                        document.getElementsByClassName('search')[0].classList.remove('active');
                                        document.getElementsByClassName('header-search')[0].classList.remove('active');

                                    }} data-bs-toggle="offcanvas" data-bs-target="#profilenavoffcanvasExample" aria-controls="profilenavoffcanvasExample">
                                        <div>
                                            <img src={user?.user?.profile} alt='profile_image' />
                                        </div>
                                        <span>{t("my_account")}</span>
                                    </button>
                                </li>
                            ) :
                                (
                                    <li className='menu-item'>
                                        {user.status === 'loading'
                                            ? (
                                                <>
                                                    <button type='button' className={`account ${mobileNavActKey == 5 ? "active" : ""}`}
                                                        // data-bs-toggle="modal" data-bs-target="#loginModal"
                                                        onClick={() => {
                                                            setShowModal(true);
                                                            handleMobileNavActKey(5);

                                                        }}>
                                                        <div>
                                                            <BiUserCircle />
                                                        </div>
                                                        <span>{t("login")}</span>

                                                    </button>

                                                </>
                                            )
                                            : (
                                                <>
                                                    <button className={`d-flex user-profile account ${mobileNavActKey == 5 ? "active" : ""}`} onClick={() => {
                                                        handleMobileNavActKey(5);
                                                        navigate("/profile");
                                                    }}>
                                                        <div className='d-flex flex-column user-info my-auto'>
                                                            <span className='name'> {user.user?.name}</span>
                                                        </div>
                                                        <img onError={placeHolderImage} src={user.user?.profile} alt="user"></img>
                                                        <span>{t("profile")}</span>
                                                    </button>
                                                </>
                                            )}


                                    </li>
                                )}


                        </ul>
                    </div>
                </nav >
                {/* login modal */}
                < Login show={showModal} setShow={setShowModal} />
                {/* location modal */}
                < Modal
                    className='location'
                    id="locationModal"
                    centered
                    open={locModal}
                    transitionName=''
                >
                    <Location isLocationPresent={isLocationPresent} setisLocationPresent={setisLocationPresent}
                        showModal={locModal} setLocModal={setLocModal} bodyScroll={setBodyScroll} />
                </Modal >





                {/* Cart Sidebar */}
                < Cart isCartSidebarOpen={isCartSidebarOpen} setIsCartSidebarOpen={setIsCartSidebarOpen} />

            </header >

        </>
    );
};

export default Header;
