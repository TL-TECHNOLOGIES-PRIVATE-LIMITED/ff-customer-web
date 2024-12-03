import React, { useEffect, useState } from 'react';
import ImagePlaceholder from "../../utils/image-placeholder/image.png";
import { useSelector } from 'react-redux';

const ImageWithPlaceholder = ({ src, alt, className, handleOnClick }) => {
    const setting = useSelector(state => state.setting);
    const [imageSrc, setImageSrc] = useState(src);  // Initialize with the actual image src
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!src || src === '') {
            // If the `src` is empty or undefined, use the placeholder image
            setImageSrc(setting.setting?.web_settings?.placeholder_image || ImagePlaceholder);
        } else {
            setImageSrc(src);
        }
    }, [src, setting]);  // Add `src` to the dependency array

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        // If there's an error loading the image, fall back to the placeholder
        setImageSrc(setting.setting?.web_settings?.placeholder_image || ImagePlaceholder);
    };

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            onLoad={handleLoad}
            onError={handleError}
            onClick={handleOnClick}
            loading='lazy'
        />
    );
};

export default ImageWithPlaceholder;
