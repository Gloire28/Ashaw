import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté (image ou vidéo uniquement)'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo max (vidéos)
});
