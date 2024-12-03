import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import HomeContainer from './homecontainer/HomeContainer';
import Loader from './loader/Loader';
import ProductContainer from './product/ProductContainerSwiper';
import { AiOutlineClose } from 'react-icons/ai';
import { Modal } from 'react-bootstrap';


const MainContainer = () => {

    const modalRef = useRef();

    const setting = useSelector(state => state.setting);
    const shop = useSelector(state => state.shop.shop);
    const aboveHomeSlider = shop?.offers?.filter((offer) => offer?.position === "top");
    const BelowHomeSlider = shop?.offers?.filter((offer) => offer.position === "below_slider");
    const BelowCategory = shop?.offers?.filter((offer) => offer.position === "below_category");
    const BelowSectionOfferArray = shop?.offers?.filter((offer) => offer.position === "below_section");

    useEffect(() => {

        if (modalRef.current && setting.setting !== null) {
            modalRef.current.click();
        }
    }, [setting]);

    const [showPop, setShowPop] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };
    return (
        <>
            {setting.setting === null
                ? <Loader screen='full' />
                : (
                    <>
                        <div className='home-page content' style={{ paddingBottom: "5px", minHeight: "75vh" }}>
                            <HomeContainer OfferImagesArray={aboveHomeSlider} BelowSliderOfferArray={BelowHomeSlider} BelowCategoryOfferArray={BelowCategory} />
                            {/* <ProductContainer showModal={showModal} setShowModal={setShowModal} BelowSectionOfferArray={BelowSectionOfferArray} /> */}
                        </div>
                        {parseInt(setting.setting.popup_enabled) === 1 ?
                            (
                                <>
                                    <Modal className='popup'
                                        centered
                                        show={showPop}
                                        // onBackdropClick={() => setShowPop(false)}
                                        backdrop={"static"}
                                    >
                                        <Modal.Header onClick={() => { setShowPop(false); }}>
                                            <AiOutlineClose size={32} fill='#fff' />
                                        </Modal.Header>
                                        <Modal.Body>
                                            <img src={setting.setting.popup_image} alt='popup_image' onClick={() => {
                                                if (setting.setting?.popup_type === "popup_url") {
                                                    window.location = setting.setting.popup_url;
                                                }
                                                else if (setting.setting?.popup_type === "category") {
                                                }
                                            }}
                                                style={{ width: "100%", height: "100%" }} onError={placeHolderImage}></img>
                                        </Modal.Body>
                                    </Modal>

                                </>
                            ) : null}
                    </>)}
        </>

    );
};

export default MainContainer;
