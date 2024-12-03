import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { t } from 'i18next';
import coverImg from '../../utils/cover-img.jpg';
import { setFilterCategory } from '../../model/reducer/productFilterReducer';
import Pagination from 'react-js-pagination';
import { setSelectedCategory } from '../../model/reducer/categoryReducer';
import Skeleton from 'react-loading-skeleton';
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';

const CategoryChild = () => {
    const total_products_per_page = 12;

    const SelectedCategory = useSelector(state => state.category?.selectedCategory);
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const setting = useSelector(state => (state.setting));
    const [offset, setoffset] = useState(0);
    const [totalProducts, settotalProducts] = useState(0);
    const [currPage, setcurrPage] = useState(1);
    const [category, setcategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isNetworkError, setIsNetworkError] = useState(false);

    const fetchCategory = () => {
        const slug_id = slug === 'all' ? "" : slug;
        setLoading(true);
        api.getCategory({
            limit: total_products_per_page,
            offset: offset,
            slug: slug_id
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setcategory(result.data);
                    settotalProducts(result.total);
                    setLoading(false);
                } else {
                    setLoading(false);
                    setcategory([]);
                }
            })
            .catch(error => {
                console.log("error ", error);
                const isNoInternet = ValidateNoInternet(error);
                if (isNoInternet) {
                    setIsNetworkError(isNoInternet);
                }
            });
    };

    useEffect(() => {
        fetchCategory();
    }, [slug, offset, SelectedCategory]);

    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };

    const handleGetCategory = (category) => {
        if (category?.has_child === true) {
            navigate(`/category/${category?.slug}`);
            // dispatch(setFilterCategory({ data: category.id }));
            if (slug === "all") {
                dispatch(setSelectedCategory(category));
            }
        } else {
            dispatch(setFilterCategory({ data: category.id }));
            navigate('/products');

        }
    };

    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_products_per_page - total_products_per_page);
    };

    useEffect(() => {
        if (!location.pathname.startsWith('/category/') || location.pathname === '/category/all') {
            dispatch(setSelectedCategory(null)); // Clear selected category state
        }
    }, [location.pathname, dispatch]);

    const placeholderItems = Array.from({ length: 12 }).map((_, index) => index);

    return (
        <>
            {!isNetworkError ? <section id='allcategories'>
                <div className='cover'>
                    <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                    <div className='page-heading'>
                        <h5 key={"category"}>{t("categories")}</h5>
                        <p>
                            <Link to="/" className='text-light text-decoration-none' onClick={() => fetchCategory(0)} key={"home"}>{t("home")} / </Link>
                            <Link to='/category/all' className='text-light text-decoration-none'
                                key={"category"}>{t("categories")} / </Link>
                            {SelectedCategory?.slug &&
                                <Link to={`/category/${SelectedCategory?.slug}`} className='text-light text-decoration-none' key={"categoryName"}>{SelectedCategory?.name} / </Link>
                            }
                            {SelectedCategory && category && SelectedCategory?.id !== category[0]?.id && category[0]?.id &&
                                <Link className='text-light text-decoration-none' key={"..."}> ... / </Link>
                            }
                        </p>
                    </div>
                </div>
                <div className='container'>
                    {loading
                        ?
                        <div className='row justify-content-center mx-3'>
                            {placeholderItems.map((index) => (
                                <div key={index} className='col-md-3 col-lg-2 col-6 col-sm-3 my-3'>
                                    <Skeleton height={250} />
                                </div>
                            ))
                            }
                        </div>
                        : null}
                    {category && (category?.length > 0) && !loading ?
                        <div className='row justify-content-center mt-5 mb-5'>
                            {category?.map((ctg, index) => (
                                <div className="col-md-3 col-lg-2 col-6 col-sm-3 my-3 content" key={index}
                                    onClick={(e) => { handleGetCategory(ctg); }}
                                >
                                    <div className='card'>
                                        {/* <img onError={placeHolderImage} className='card-img-top' src={ctg.image_url} alt='allCategories' loading='lazy' /> */}
                                        <ImageWithPlaceholder src={ctg?.image_url} className='card-img-top' alt={"allCategories"} />
                                        <div className='card-body' style={{ cursor: "pointer" }}>
                                            <p>
                                                {ctg.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div> : null}

                    {category?.length === 0 && !loading ?
                        <>
                            <div className='no-product' style={{
                                height: "50vh", width: "100%", display: "flex", alignItems: "center",
                                justifyContent: "center", textAlign: "center", fontSize: "24px"
                            }}>

                                <p>No Categories Found</p>
                            </div>
                        </>
                        : null}

                    {totalProducts > total_products_per_page &&
                        <div className='mt-5 mb-5'>
                            <Pagination
                                itemClass='categoryListPagination'
                                activePage={currPage}
                                itemsCountPerPage={total_products_per_page}
                                totalItemsCount={totalProducts}
                                pageRangeDisplayed={5}
                                onChange={handlePageChange.bind(this)}
                            />
                        </div>
                    }
                </div>
            </section>
                :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>
            }

        </>
    );

};

export default CategoryChild;
