import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { useLocation, useNavigate } from 'react-router-dom';
import * as newApi from "../../api/apiCollection"
import Loader from '../loader/Loader';
import No_Orders from '../../utils/zero-state-screens/No_Orders.svg';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { setCategory } from '../../model/reducer/categoryReducer';
import { clearAllFilter, setFilterBrands, setFilterByCountry, setFilterBySeller, setFilterCategory, setFilterMinMaxPrice, setFilterProductSizes, setFilterSearch, setFilterSection, setFilterSort } from '../../model/reducer/productFilterReducer';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Popup from "../same-seller-popup/Popup";
// import "./product.css";
import CategoryComponent from './Categories';
import { MdSignalWifiConnectedNoInternet0 } from "react-icons/md";

import ProductCard from './ProductCard';
import ListViewCard from "./ListViewCard"
import { BsFillGrid3X3GapFill } from 'react-icons/bs';
import { FaThList } from 'react-icons/fa';
import { Collapse, Slider, Checkbox } from "antd";
import HorizonalProduct from './HorizontalProductCard';

const ProductList2 = React.memo(() => {
    const total_products_per_page = 12;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const closeCanvas = useRef();
    const category = useSelector(state => state.category?.category);
    const city = useSelector(state => state.city);
    const filter = useSelector(state => state.productFilter);
    const setting = useSelector(state => (state.setting));
    const user = useSelector(state => (state.user));
    const shop = useSelector((state) => state.shop);

    const [productresult, setproductresult] = useState([]);
    const [brands, setbrands] = useState(null);
    const [isGridView, setIsGridView] = useState(true)
    const [offset, setoffset] = useState(0);
    const [totalProducts, settotalProducts] = useState(0);
    const [currPage, setcurrPage] = useState(1);
    const [isLoader, setisLoader] = useState(false);
    const [minPrice, setMinPrice] = useState(null);
    const [maxPrice, setMaxPrice] = useState(null);
    const [values, setValues] = useState([]);
    const [sizes, setSizes] = useState([]);
    const location = useLocation();
    const [showPriceFilter, setShowPriceFilter] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState(filter?.category_id !== null ? [filter?.category_id] : []);
    const [networkError, setNetworkError] = useState(false);
    const { t } = useTranslation();
    const [totalBrands, setTotalBrands] = useState(null)
    const [brandOffset, setBrandOffset] = useState(0);
    const [tempMinPrice, setTempMinPrice] = useState(null)
    const [tempMaxPrice, setTempMaxPrice] = useState(null)

    const brandLimit = 10;


    const fetchBrands = async (bOffset) => {
        try {
            const result = await newApi.getBrands({ limit: brandLimit, offset: bOffset });
            if (result.status === 1) {
                if (brands == null) {
                    setbrands(result?.data)
                } else {
                    setbrands(prevBrands => [...prevBrands, ...result?.data]);
                }
                setTotalBrands(result?.total)
            }
        } catch (error) {
            console.log("Error", error)
        }
    };

    const loadMoreBrands = () => {
        setBrandOffset(prevOffset => prevOffset + brandLimit);
        fetchBrands(brandOffset + brandLimit) // Increase offset to fetch next set of brands
    };


    const fetchCategories = async (id = 0) => {
        try {
            setisLoader(true);
            const result = await newApi.getCategory({ id: id });
            if (result.status === 1) {
                dispatch(setCategory({ data: result.data }));
            }
            setisLoader(false);
        } catch (error) {
            setisLoader(false);
            console.log("Error", error)
        }
    };

    const handlePrices = async (result) => {
        if (minPrice == null && maxPrice == null && filter?.price_filter == null) {
            setMinPrice(parseInt(result.total_min_price));
            if (result.total_min_price === result.total_max_price) {
                setMaxPrice(parseInt(result.total_max_price) + 100);
                setValues([parseInt(result.total_min_price), parseInt(result.total_max_price) + 100]);
            } else {
                setMaxPrice(parseInt(result.total_max_price));
                setValues([parseInt(result.total_min_price), parseInt(result.total_max_price)]);
            }
        }
    }

    const filterProductsFromApi = async (filter) => {
        try {
            setisLoader(true);
            const result = await newApi.productByFilter({ latitude: city?.city?.latitude, longitude: city?.city?.longitude, filters: filter })
            if (result.status === 1) {
                if (filter?.search) {
                    setoffset(0);
                }
                handlePrices(result)
                if ((filter.category_ids || filter.brand_ids || filter.price_filter?.min_price || filter.price_filter?.max_price || filter?.search) && (offset == 0)) {
                    setproductresult(result.data);
                } else {
                    if (offset === 0) {
                        setproductresult(result.data);
                    } else {
                        setproductresult((prevProduct) => [...prevProduct, ...result.data]);
                    }
                    // setproductresult((prevProduct) => [...prevProduct, ...result.data]);
                }
                setSizes(result.sizes);
                settotalProducts(result.total);
                setShowPriceFilter(true);
            } else {
                setproductresult([]);
                settotalProducts(0);
                setSizes([]);
                setShowPriceFilter(false);
            }
            setisLoader(false);
        } catch (error) {
            const regex = /Failed to fetch/g;
            if (regex.test(error.message)) {
                console.log("Network Error");
                setNetworkError(true);
            }
            console.log(error.message);
        }

    };


    const sort_unique_brand_ids = (int_brand_ids) => {
        if (int_brand_ids.length === 0) return int_brand_ids;
        int_brand_ids = int_brand_ids.sort(function (a, b) { return a * 1 - b * 1; });
        var ret = [int_brand_ids[0]];
        for (var i = 1; i < int_brand_ids.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
            if (int_brand_ids[i - 1] !== int_brand_ids[i]) {
                ret.push(int_brand_ids[i]);
            }
        }
        return ret;
    };

    const handleGridViewChange = () => {
        setIsGridView(true)
    }

    const handleListViewChange = () => {
        setIsGridView(false)
    }


    const filterbyBrands = (brand) => {
        setcurrPage(1);
        setoffset(0);
        var brand_ids = [...filter.brand_ids];
        if (brand_ids.includes(brand.id)) {
            brand_ids.splice(brand_ids.indexOf(brand.id), 1);
        }
        else {
            brand_ids.push(parseInt(brand.id));
        }
        const sorted_brand_ids = sort_unique_brand_ids(brand_ids);
        dispatch(setFilterBrands({ data: sorted_brand_ids }));
    };

    const filterBySeller = (seller) => {
        dispatch(setFilterBySeller({ data: seller?.id }))
    }

    useEffect(() => {
        if (brands == null) {
            fetchBrands(0);
        }

        if (category === null) {
            fetchCategories();
        }
        if (location.pathname === "/products") {
            filterProductsFromApi({
                min_price: filter.price_filter?.min_price,
                max_price: filter.price_filter?.max_price,
                category_ids: filter?.category_id,
                brand_ids: filter?.brand_ids.toString(),
                sort: filter?.sort_filter,
                search: filter?.search,
                limit: total_products_per_page,
                sizes: filter?.search_sizes?.filter(obj => obj.checked).map(obj => obj["size"]).join(","),
                offset: offset,
                unit_ids: filter?.search_sizes?.filter(obj => obj.checked).map(obj => obj["unit_id"]).join(","),
                seller_id: filter?.seller_id,
                country_id: filter?.country_id,
                section_id: filter?.section_id
            });

        }

    }, [filter.search, filter.category_id, filter.brand_ids, filter.sort_filter, filter?.search_sizes, filter?.price_filter, offset]);



    useEffect(() => {
        setproductresult([])
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleFetchMore = async () => {
        setoffset(offSet => offSet + total_products_per_page)
    }

    const Filter = () => {
        return (
            <>
                <div className='product-filter'>
                    <div className='filter-header'>
                        <div className='filter-sub-header '>
                            <h5>Filters</h5>

                            <p className='m-0' role='button'
                                onClick={() => {
                                    setSelectedCategories([]);
                                    setMinPrice(null);
                                    setMaxPrice(null);
                                    dispatch(clearAllFilter());
                                    setoffset(0)
                                    setproductresult([])
                                }}
                            >
                                Clear All
                            </p>
                        </div>
                    </div>
                    <Collapse defaultActiveKey={['1', '2', '3']} >
                        <Collapse.Panel header={t("product_category")} key="1" >
                            <div className='filter-row'>
                                <CategoryComponent data={category} selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} setproductresult={setproductresult} setoffset={setoffset} />
                            </div>
                        </Collapse.Panel>
                        {brands?.length <= 0 ? null : <Collapse.Panel header={t("brands")} key="2">
                            <div className='filter-row'>
                                {
                                    brands == null ? (<Loader />) :
                                        brands?.map((brand, index) => {
                                            const isChecked = filter.brand_ids.includes(brand.id);
                                            return (
                                                <div key={brand.id}>
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            setproductresult([])
                                                            filterbyBrands(brand)
                                                        }}

                                                    >
                                                        <Checkbox.Group>
                                                        </Checkbox.Group>
                                                    </Checkbox>
                                                    <span className='brand-name'>{brand.name}</span>
                                                </div>
                                            );
                                        })
                                }
                                {brands?.length < totalBrands ? <a className='brand-view-more' onClick={loadMoreBrands}>{t("showMore")}</a> : <></>}

                            </div>
                        </Collapse.Panel>}
                        {/* {shop?.shop?.sellers?.length <= 0 ? null :
                            <Collapse.Panel header={t("seller")} key="3">
                                <div className='filter-row'>
                                    {shop?.shop?.sellers?.length <= 0 ? null :
                                        shop?.shop?.sellers?.map((seller) => {
                                            const isChecked = filter.brand_ids.includes(seller.id);
                                            return (
                                                <div key={seller.id}>
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            setproductresult([])
                                                            filterBySeller(seller)
                                                        }}
                                                    >
                                                        <Checkbox.Group>
                                                        </Checkbox.Group>
                                                    </Checkbox>
                                                    <span className='brand-name'>{seller.name}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </Collapse.Panel>
                        } */}
                        <Collapse.Panel header={t("priceRange")} key="3">
                            <div>
                                <Slider range min={minPrice}
                                    max={maxPrice} step={0.01} onChange={(newValues) => {
                                        setValues(newValues);
                                    }}
                                    value={values}
                                    onChangeComplete={
                                        (newValues) => {
                                            setTempMinPrice(newValues[0])
                                            setTempMaxPrice(newValues[1])
                                        }
                                    }
                                />
                                <div className='range-prices'>
                                    <p>{setting?.setting?.currency}{values[0]}</p>
                                    <p>{setting?.setting?.currency}{values[1]}</p>
                                </div>
                                <button className='price-filter-apply-btn' onClick={(newValues) => {
                                    setoffset(0)
                                    setproductresult([])
                                    dispatch(setFilterMinMaxPrice({ data: { min_price: tempMinPrice, max_price: tempMaxPrice } }))
                                }}>
                                    Apply
                                </button>
                            </div>
                        </Collapse.Panel>
                    </Collapse>
                </div>
            </>
        );
    };



    const placeholderItems = Array.from({ length: 12 }).map((_, index) => index);
    return (
        <>
            {!networkError ?
                <>
                    <div id='productListingBreadcrumb' className='w-100 breadCrumbs'>
                        <div className='container d-flex align-items-center gap-2'>
                            <div className='breadCrumbsItem'>
                                <Link to={"/"}>{t("home")}</Link>
                            </div>
                            <div className='breadCrumbsItem'>/</div>
                            <div className='breadCrumbsItem'>
                                <Link className={location.pathname === "/products" ? "breadCrumbActive" : ""} to={"/products"}>{t("products")}</Link>
                            </div>
                        </div>
                    </div>
                    <section id="productlist" className='container' onContextMenu={() => { return false; }}>

                        <div className='row justify-content-center' id='products'>
                            <div className="hide-desktop col-3 offcanvas offcanvas-start" tabIndex="-1" id="filteroffcanvasExample" aria-labelledby="filteroffcanvasExampleLabel" >
                                <div className="canvas-header">
                                    <div className='site-brand'>
                                        <img src={setting.setting && setting.setting.web_settings.web_logo} height="50px" alt="logo"></img>
                                    </div>

                                    <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeCanvas} onClick={() => {


                                    }}><AiOutlineCloseCircle fill='black' /></button>
                                </div>
                                {Filter()}
                            </div>


                            {/* filter section */}
                            <div className='flex-column col-2 col-md-3 col-md-auto filter-container hide-mobile-screen' style={{ gap: "30px" }}>
                                {Filter()}
                            </div>

                            {/* products according to applied filter */}
                            <div className='d-flex flex-column col-md-9 col-12 h-100 productList_container' style={{ gap: '20px' }}>
                                <div className="row">
                                    {!isLoader ? (<>
                                        <div className='d-flex col-12 flex-row justify-content-between align-items-start filter-view flex-column flex-lg-row flex-md-row align-items-lg-center align-items-md-center'>
                                            <div className='d-flex gap-3 '>
                                                <span className='total_product_count'>{totalProducts} - {t("products_found")}</span>

                                            </div>

                                            <div className="select ">
                                                {/* {!totalProducts ? */}
                                                <div className='d-flex align-items-center'>
                                                    <span className='sort-by'>Sort By</span>
                                                    <select className="form-select" aria-label="Default select example" defaultValue={filter.sort_filter} onChange={(e) => {
                                                        setproductresult([])
                                                        dispatch(setFilterSort({ data: e.target.value }));
                                                    }}>
                                                        <option value="">{t("default")}</option>
                                                        <option value="new">{t("newest_first")}</option>
                                                        <option value="old">{t("oldest_first")}</option>
                                                        <option value="high">{t("high_to_low")}</option>
                                                        <option value="low">{t("low_to_high")}</option>
                                                        <option value="discount">{t("discount_high_to_low")}</option>
                                                        <option value="popular">{t("popularity")}</option>
                                                    </select>
                                                </div>
                                                <div className='layout-icons'>
                                                    <span onClick={handleGridViewChange} className={isGridView ? "active-view" : ""}>
                                                        <BsFillGrid3X3GapFill />
                                                    </span>
                                                    <span onClick={handleListViewChange} className={isGridView == false ? "active-view" : ""}>
                                                        <FaThList />
                                                    </span>
                                                </div>


                                            </div>
                                        </div>
                                    </>) :
                                        (
                                            <Skeleton height={49} borderRadius={8} />
                                        )
                                    }



                                    {productresult === null || isLoader
                                        ? (
                                            <>
                                                <div className='h-100 productList_content'>
                                                    <div className='row flex-wrap'>
                                                        {placeholderItems.map((index) => (
                                                            <div key={index} className={`${!isGridView ? 'col-12 list-view ' : 'col-md-6 col-sm-6 col-lg-4 col-12 flex-column mt-3 col-xl-3'}`}>
                                                                <Skeleton height={230} className='mt-3' borderRadius={8} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                            </>
                                        )
                                        : (
                                            <>
                                                {productresult.length > 0 && isLoader == false
                                                    ? (
                                                        <div className='h-100 productList_content'>
                                                            <div className="row  flex-wrap">
                                                                {isGridView ? productresult.map((product, index) => (
                                                                    <div key={product?.id} className='col-md-6 col-sm-6 col-lg-4 col-12 product-list-grid col-xl-3'>
                                                                        <ProductCard product={product} />
                                                                    </div>
                                                                )) : productresult.map((product, index) => (
                                                                    <div key={product?.id} className=' col-12 my-2 '>
                                                                        <ListViewCard product={product} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className='pagination'>
                                                                {(totalProducts > productresult?.length) ?
                                                                    <button className='load-mote-btn' onClick={handleFetchMore}>Load More</button>
                                                                    : null
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                    : (
                                                        <div className='no-product'>
                                                            <img src={No_Orders} style={{ width: '40%' }} alt='no-product' className='img-fluid'></img>
                                                            <p>No Products Found</p>
                                                        </div>
                                                    )}
                                            </>
                                        )}
                                </div>
                            </div>

                        </div>

                    </section>
                </>
                :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>}
        </>

    );

});

export default ProductList2;