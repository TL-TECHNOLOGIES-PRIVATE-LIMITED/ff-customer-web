import './category.css';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import { ActionTypes } from '../../model/action-type';
import coverImg from '../../utils/cover-img.jpg';
import { useTranslation } from 'react-i18next';
import { BiArrowBack } from 'react-icons/bi';
import { setCategory } from '../../model/reducer/categoryReducer';
import { setFilterBrands, setFilterCategory } from '../../model/reducer/productFilterReducer';
import CategoryChild from './CategoryChild';




const ShowAllCategories = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setting = useSelector(state => (state.setting));
  const category = useSelector(state => (state.category));
  const city = useSelector(state => (state.city));

  const [isLoader, setisLoader] = useState(false);
  const [showbackButton, setShowbackButton] = useState(false);
  const [arr, setArr] = useState([]);
  // console.log(arr);

  const getProductfromApi = async (ctg) => {
    await api.getProductbyFilter( city.city.latitude, city.city.longitude, { category_id: ctg.id })
      .then(response => response.json())
      .then(result => {
        if (result.status === 1) {
          setMap(new Map(map.set(`category${ctg.id}`, result.total)));
        }
      });
  };

  //fetch Category
  const fetchCategory = (id = 0) => {
    setisLoader(true);
    api.getCategory(id)
      .then(response => response.json())
      .then(result => {
        if (result.status === 1) {
          dispatch(setCategory({ data: result.data }));
        }
        setisLoader(false);
      })
      .catch(error => {
        setisLoader(false);
        console.log("error ", error);
      }
      );
  };

  useEffect(() => {
    if (category.status === 'loading' && category.category === null) {
      fetchCategory();

    }
    // else if (category.status !== 'loading' || city.city !== null) {
    //   category.category.forEach(ctg => {
    //     getProductfromApi(ctg);
    //   });
    // }
  }, [category]);

  useEffect(() => {
    const handleBrowserBack = (e) => {
      console.log(e);
      console.log("Browser Back Button Clicked");
    };
    window.addEventListener("popstate", handleBrowserBack);
    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
    };
  }, []);
  //categories and their product count map
  const [map, setMap] = useState(new Map());

  const selectCategory = (category) => {
    if (category.has_child) {
      fetchCategory(category.id);

      setShowbackButton(true);
    } else {
      dispatch(setFilterCategory({ data: category.id }));
      navigate('/products');
    }
  };

  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [category]);

  const placeHolderImage = (e) => {
    e.target.src = setting.setting?.web_logo;
  };
  return (
    <section id='allcategories'  >
      <div className='cover'>
        <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
        <div className='page-heading'>
          <h5 key={"category"}>{t("categories")}</h5>
          <p><Link to="/" className='text-light text-decoration-none' onClick={() => fetchCategory(0)} key={"home"}>{t("home")} / </Link>
            <Link className='text-light text-decoration-none' onClick={() => {
              fetchCategory(0);
              setArr([]);
            }} key={"category"}>{t("categories")} / </Link>
            {/* {console.log(arr)} */}
            {arr.map((Name, index) => (
              <>
                <Link className='text-light text-decoration-none' key={index}
                  onClick={() => {
                    selectCategory(Name);
                    arr.splice(index, arr.length + 1);
                  }}>
                  {Name.name?.length > 10 ? (Name.name.slice(0, 10)) : Name.name}...
                </Link> / &nbsp;
              </>
            ))}
          </p>
        </div>
      </div>

      <div className='container' style={{ padding: "30px 0" }}>
        {showbackButton ?
          <div className='back-button' onClick={() => {
            fetchCategory();
            navigate(-1);
            dispatch(setFilterCategory({ data: null }));
            setShowbackButton(false);
          }}>
            <BiArrowBack size={32} fill={'var(--secondary-color)'} />
          </div>
          : <></>}

        {category.status === 'loading'
          ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )
          : (
            <div className='row justify-content-center'>

              {category.category.map((ctg, index) => (
                <div className="col-md-3 col-lg-2 col-6 col-sm-3 my-3 content" key={index} onClick={() => { setArr([...arr, ctg]); selectCategory(ctg); }}>
                  <div className='card'>
                    <img onError={placeHolderImage} className='card-img-top' src={ctg.image_url} alt='allCategories' loading='lazy' />
                    <div className='card-body' style={{ cursor: "pointer" }}>
                      <p>
                        {ctg.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}


            </div>
          )}
      </div>
    </section>
  );
};

export default ShowAllCategories;
