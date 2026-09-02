import { useState } from 'react';

const ProductGallery = ({ product }) => {
  const media = [
    { type: 'image', url: product.mainPhotoUrl },
    ...product.additionalPhotos.map((url) => ({ type: 'image', url })),
    ...(product.videoUrl ? [{ type: 'video', url: product.videoUrl }] : []),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const active = media[activeIndex] ?? media[0];

  return (
    <div>
      <div className="gallery__main">
        {active.type === 'video' ? (
          <video src={active.url} controls />
        ) : (
          <img src={active.url} alt={product.name} />
        )}
      </div>
      {media.length > 1 && (
        <div className="gallery__thumbs">
          {media.map((item, index) => (
            <button
              key={item.url}
              type="button"
              className={`gallery__thumb${index === activeIndex ? ' active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={item.type === 'video' ? 'Voir la vidéo' : `Voir la photo ${index + 1}`}
            >
              {item.type === 'video' ? (
                <video src={item.url} muted />
              ) : (
                <img src={item.url} alt="" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
