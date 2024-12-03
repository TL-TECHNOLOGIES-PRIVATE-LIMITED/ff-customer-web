import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Inline from "yet-another-react-lightbox/plugins/inline";
import { Lightbox } from "yet-another-react-lightbox";
import "./lightbox.css";

const LightBox = ({ open, setOpen, images, imageIndex, isModal, setIsModal }) => {
    // console.log(images);
    return (
        <Lightbox
            index={imageIndex}
            open={open}
            styles={{
                container: {
                    backgroundColor: "#000000bf",
                }
            }}
            controller={isModal ? { closeOnBackdropClick: true } : {}}
            carousel={!isModal ? { finite: images?.length === 1 ? true : false } : {
                spacing: 0,
                padding: 0,
                imageFit: "contain",
                finite: images?.length === 1 ? true : false
            }}
            close={() => {
                setOpen(false);
                if (isModal) {
                    setIsModal(false);
                }
            }}
            slides={images}
            render={{
                buttonNext: images?.length === 1 ? () => null : undefined,
                buttonPrev: images?.length === 1 ? () => null : undefined,
            }
            }
            toolbar={isModal ? {
                buttons: [
                    <button key="my-button" type="button" className="yarl__button" onClick={() => setOpen(false)}>
                        x
                    </button>,
                    "close",
                ],
            } : {}}
            inline={isModal ? {
                style: {
                    width: "100%",
                    maxWidth: "900px",
                    aspectRatio: "6 / 4",
                    margin: "0 auto",
                    height: "480px"
                },
            } : {}}
            plugins={!isModal ? [Zoom] : [Inline]}
        />
    );
};

export default LightBox;