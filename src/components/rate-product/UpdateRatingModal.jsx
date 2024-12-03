import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { LuStar } from 'react-icons/lu';
import UploadPhoto from "../../utils/UploadPhoto.svg";
import { toast } from "react-toastify";
import "./rateproduct.css";
import api from '../../api/api';
import Loader from "../loader/Loader";
import { useSelector } from 'react-redux';




const UpdateRatingModal = (props) => {

  const { t } = useTranslation();
  const user = useSelector(state => state.user);

  const [activeIndex, setActiveIndex] = useState(null);
  const [review, setReview] = useState("");
  const [files, setFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [rating, setRating] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      setLoading(true);
      try {
        const response = await api.getProductRatingById(user?.jwtToken, props.ratingId);
        const result = await response.json();
        setRating(result?.data);
        setReview(result?.data?.review);
        setActiveIndex(result?.data?.rate);
        setFiles(result?.data?.images);
      } catch (err) {
        console.log(err?.message);
      }
      setLoading(false);

    };
    if (props.showModal == true)
      fetchRating();
  }, [props.showModal]);

  const handleActive = (index) => {
    setActiveIndex(index == activeIndex ? null : index);
  };
  const handleReviewChange = (e) => {
    setReview(e.target.value);
  };
  const handleOldFileDelete = (imageId) => {
    const updatedFiles = files.filter((file) => file.id !== imageId);
    setDeletedImageIds((prevIds) => [...prevIds, imageId]);
    setFiles(updatedFiles);
  };
  const handleNewFileDelete = (image) => {
    // console.log(image?.name);
    const updatedFiles = newFiles.filter((file) => file.name !== image?.name);
    setNewFiles(updatedFiles);
  };
  const handleFileUpload = (e) => {
    const newFileArray = Array.from(e.target.files);
    const allowedFiles = ["image/png", "image/jpg", "image/jpeg"];
    const validFiles = newFileArray.filter((file) => allowedFiles.includes(file.type));
    setNewFiles([...validFiles]);

  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeIndex === null) {
      toast.error(t("product_rating_is_required"));
      return;
    }
    try {
      const response = await api.updateProductRating(user?.jwtToken, props?.ratingId, activeIndex, review, newFiles, deletedImageIds?.join(","));
      const result = await response.json();
      props.setShowModal(false);
      if (result.message == "The image.0 must be an image.") {
        toast.error(t("only_images_are_allowed"));
      } else {
        toast.success(result.message);
      }
      setActiveIndex(null);
      setReview("");
      setNewFiles([]);
      setFiles([]);
      setDeletedImageIds([]);
      props.setRatingId(0);
    } catch (err) {
      toast.error(err.message);

    }
  };
  return (
    <>
      <Modal
        size="md"
        centered
        className="rateProductModal"
        show={props.showModal}
        backdrop={"static"}
      >
        <Modal.Header className="d-flex justify-content-between">
          <div className="d-flex justify-content-between align-items-center">
            <div className="modalHeading">
              {t("rate_the_product")}
            </div>
          </div>

          <div>
            <button type="button"
              onClick={() => {
                props.setShowModal(false);

              }}>
              <AiOutlineCloseCircle size={30} className="crossLogo" />
            </button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => handleSubmit(e)} className="rateForm">
            {loading ?

              <Loader width="100%" height="600px" /> :
              <div className="d-flex justify-content-center align-items-center flex-column">
                <div className="container mb-5">
                  <p className="modalSubHeading">{t("overall_rating")} :</p>
                  <div className="d-flex justify-content-around gap-5">
                    <div className="starBackground">
                      <LuStar className={`star ${activeIndex >= 1 ? "active " : ""}`} onClick={() => handleActive(1)} />
                    </div>
                    <div className="starBackground">
                      <LuStar className={`star ${activeIndex >= 2 ? "active " : ""}`} onClick={() => handleActive(2)} />

                    </div>
                    <div className="starBackground">
                      <LuStar className={`star ${activeIndex >= 3 ? "active " : ""}`} onClick={() => handleActive(3)} />
                    </div>
                    <div className="starBackground">
                      <LuStar className={`star ${activeIndex >= 4 ? "active " : ""}`} onClick={() => handleActive(4)} />
                    </div>
                    <div className="starBackground">
                      <LuStar className={`star ${activeIndex >= 5 ? "active " : ""}`} onClick={() => handleActive(5)} />
                    </div>
                  </div>
                </div>
                <div className="container mt-3">
                  <p className="modalSubHeading">{t("product_review")} :</p>
                  <div className="">
                    <textarea
                      required
                      name="productReview"
                      className="reviewTextArea"
                      value={review}
                      rows={5}
                      placeholder={t("write_review_here")}
                      onChange={handleReviewChange}
                    />
                  </div>
                </div>
                <div className="container mt-3">
                  <p className="modalSubHeading">{t("add_photos")}:</p>
                  <div className="d-flex flex-row flex-wrap justify-content-start">
                    {files?.map((image) => (
                      <div div key={image?.id} className="uploadedImagesContainer">
                        <img className="uploadedImages" src={image?.image_url} alt="uploadedImage" loading="lazy" />
                        <div className="deleteUploaded d-flex justify-content-center align-items-center"
                          onClick={() => handleOldFileDelete(image?.id)}
                        >x</div>
                      </div>
                    ))}
                    {newFiles?.map((image) => (
                      <div div key={image} className="uploadedImagesContainer">
                        <img className="uploadedImages" src={URL.createObjectURL(image)} alt="uploadedImage" loading="lazy" />
                        <div className="deleteUploaded d-flex justify-content-center align-items-center"
                          onClick={() => handleNewFileDelete(image)}
                        >x</div>
                      </div>
                    ))}
                  </div>
                  <label htmlFor="fileInput" className="modalSubHeading">
                    <div className="uploadContainer">
                      <img src={UploadPhoto} alt="uploadImage" className="placeHolderImage" />
                      <input
                        type="file"
                        accept=".jpg, .png, .jpeg"
                        id="fileInput"
                        className="file-input"
                        multiple
                        onChange={handleFileUpload}
                        aria-placeholder="Upload" />
                    </div>
                  </label>
                </div>
                <hr />
                <div className="d-flex justify-content-end w-100 mt-3">
                  <button type="submit" className="submitRating">
                    {t("submit_review")}
                  </button>

                </div>
              </div>
            }
          </form>
        </Modal.Body>
      </Modal>
    </>

  );
};

export default UpdateRatingModal;