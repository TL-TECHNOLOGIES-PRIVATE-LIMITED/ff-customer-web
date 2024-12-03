import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './notification.css';
import { IoNotifications } from 'react-icons/io5';
import Pagination from 'react-js-pagination';
import api from '../../api/api';
import Loader from '../loader/Loader';
import coverImg from '../../utils/cover-img.jpg';
import No_Notification from '../../utils/zero-state-screens/No_Notification.svg';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setNotification } from '../../model/reducer/notificationReducer';
import { formatNotificationDate } from '../../utils/formatDate';
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';

const Notification = () => {
  const user = useSelector(state => (state.user));
  const setting = useSelector(state => (state.setting));

  const dispatch = useDispatch();

  const total_notification_per_page = 10;


  const [totalNotification, settotalNotification] = useState(null);
  const [currPage, setcurrPage] = useState(1);
  const [notification, setnotifications] = useState(null);
  const [offset, setoffset] = useState(0);
  const [isLoader, setisLoader] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);

  const fetchNotification = () => {
    api.getNotification(user?.jwtToken, total_notification_per_page, offset)
      .then(response => response.json())
      .then(result => {
        if (result.status === 1) {
          setisLoader(false);
          dispatch(setNotification({ data: result.data }));
          setnotifications(result.data);
          settotalNotification(result.total);
        }
      })
      .catch(error => {
        const isNoInternet = ValidateNoInternet(error);
        if (isNoInternet) {
          setIsNetworkError(isNoInternet);
        }
      });
  };


  useEffect(() => {
    setisLoader(true);
    fetchNotification();
  }, [offset]);


  //page change
  const handlePageChange = (pageNum) => {
    setcurrPage(pageNum);
    setoffset(pageNum * total_notification_per_page - total_notification_per_page);
  };
  const { t } = useTranslation();
  const placeHolderImage = (e) => {
    e.target.src = setting.setting?.web_logo;
  };
  return (
    <>

      {!isNetworkError ?
        <div className='notification'>
          <div className='cover'>
            <img src={coverImg} className='img-fluid' alt="cover"></img>
            <div className='title'>
              <h3>{t("notification")}</h3>
              <span><Link to="/" className='text-light text-decoration-none'>{t("home")} / </Link></span><span className='active'>{t("notification")}</span>
            </div>
          </div>
          {notification === null
            ? (
              <Loader width="100%" height="500px" background={"var(--second-cards-color)"} />
            )
            : (
              <div className="container">

                <div className='notification-container'>
                  <div className="notifications">
                    <div className='heading'> {t("all_notification")}</div>
                    {notification.length === 0
                      ? (<div className='notification-body no-notification'>
                        <img src={No_Notification} className='no-data-img' alt='no-notification'></img>
                        <p>{t("empty_notification_list_message")}</p>
                      </div>)
                      : (
                        <>
                          {isLoader ? <Loader width='100%' height='300px' /> : (
                            <div className='notification-body'>
                              {notification.map((ntf, index) => (
                                <div key={index} className='wrapper'>
                                {ntf.image_url === "" ? <div className='logo col-4 col-lg-2 col-md-3' style={{ background: "var(--secondary-color)" }}><IoNotifications fill='#fff' fontSize='5rem' /></div> : <img onError={placeHolderImage} src={ntf.image_url} alt='notification' className='col-4 col-lg-2 col-md-3'></img>}
                                  <div className='content col-4 col-lg-8 col-md-6'>
                                    <p className='title'>{ntf.title}</p>
                                    <p>{ntf.message}</p>
                                    <Link className='notification-link'>{`${t("goto")} products`}</Link>
                                  </div>
                                  <div className='d-flex flex-column justify-content-center col-4 col-lg-2 col-md-3'>
                                    <span>
                                      {formatNotificationDate(ntf.date_sent)}
                                    </span>
                                    <span>{ntf.date_sent.split(" ")[1]}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {notification.length !== 0 ?
                            <Pagination
                              itemClass='notificationPagination'
                              activePage={currPage}
                              itemsCountPerPage={total_notification_per_page}
                              totalItemsCount={totalNotification}
                              pageRangeDisplayed={5}
                              onChange={handlePageChange.bind(this)}
                            />
                            : null}
                        </>
                      )}
                  </div>
                </div>
              </div>)}
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

export default Notification;
