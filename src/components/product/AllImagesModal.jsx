import React, { useEffect, useState } from 'react';
import LightBox from '../lightbox/LightBox';
import { Modal } from 'react-bootstrap';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import api from '../../api/api';
import { useSelector } from 'react-redux';

const AllImagesModal = (props) => {
    // console.log(props);
    const user = useSelector(state => state?.user);
    const [open, setOpen] = useState(false);
    const [lightBoxImages, setLightBoxImages] = useState([]);
    const [currImageIndex, setCurrImageIndex] = useState(-1);
    const [ratingImages, setRatingImages] = useState([]);
    const [totalImages, setTotalImages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModal, setIsModal] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchAllRatingImages = async () => {
            try {
                const response = await api.getProductRatingImages(user?.jwtToken, props.product_id, props.totalImages, 0);
                const result = await response.json();
                setRatingImages(result.data);
                setTotalImages(result.total);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        if (props?.show && props?.userImages == null) {
            fetchAllRatingImages();
        }
        if (props?.userImages) {
            setLightBoxImages(props?.userImages?.map((image) => ({ src: image?.image_url ? image?.image_url : image })));
            setRatingImages(props?.userImages?.map((image) => ({ image_url: image?.image_url ? image?.image_url : image })));
            // setCurrImageIndex(props?.index);
            // setOpen(true);
            setIsModal(true);
        }
    }, [props]);

    const handleImageClick = (images, imageIndex) => {
        setLightBoxImages(images.map((image) => ({ src: image?.image_url ? image?.image_url : image })));
        setCurrImageIndex(imageIndex);
        setOpen(true);
        setIsModal(true);
    };
    return (
        <Modal
            show={props.show}
            size='lg'
            centered
            backdrop="static"
        >
            <Modal.Header className='d-flex justify-content-between'>
                <div></div>
                <AiOutlineCloseCircle onClick={() => {
                    props.setShow(false);
                    setOpen(false);
                    props.setUserImages(null);
                    props.setIndex(-1);
                }} fill='var(--font-color)' className='cursorPointer' size={30} />
            </Modal.Header>
            <Modal.Body style={{ overflowX: 'auto', maxHeight: '500px', minHeight: "500px", }}>
                <div className='d-flex flex-row flex-wrap justify-content-center align-items-center gap-5'>
                    {!open ? ratingImages?.map((image, index) => (
                        <div key={`${image}-${index}`} className={"cursorPointer"}
                            onClick={() => {
                                handleImageClick(ratingImages, index);
                            }}>
                            <img src={image?.image_url ? image?.image_url : image} alt='ratingImg' className='cursorPointer' loading='lazy' style={{ height: "80px", width: "80px" }} />
                        </div>
                    )) : null}
                </div>
                <div>
                    {open ? <LightBox isModal={isModal} setIsModal={setIsModal} open={open} setOpen={setOpen} imageIndex={currImageIndex} images={lightBoxImages} /> : null}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default AllImagesModal;