import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/backblaze.js';
import { config } from '../config/index.js';

const bucketName = config.backblaze.bucketName;
const endpoint = config.backblaze.endpoint; 

/**
 * Upload un fichier (buffer) vers Backblaze
 * @param {Object} file 
 * @param {string} folder 
 * @returns {string} 
 */
export const uploadMedia = async (file, folder = 'booking') => {
  // Générer un nom de fichier unique
  const extension = file.originalname.split('.').pop();
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const publicUrl = `${endpoint}/${bucketName}/${key}`;


  return publicUrl;
};

/**
 * Supprime un fichier de Backblaze
 * @param {string} publicUrl - L'URL publique du fichier (ou le key)
 * @param {string} resourceType - Ignoré ici, gardé pour compatibilité
 */
export const deleteMedia = async (publicUrl, resourceType = 'image') => {
  // Extraire la clé (key) depuis l'URL
  // Ex: https://.../file/booking-storage/booking/123.jpg -> key = booking/123.jpg
  const key = publicUrl.split(`/file/${bucketName}/`)[1];
  if (!key) throw new Error('Impossible d\'extraire la clé depuis l\'URL');

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
};