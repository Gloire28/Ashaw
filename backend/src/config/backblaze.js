import { S3Client } from '@aws-sdk/client-s3';
import { config } from './index.js'; 

const s3Client = new S3Client({
  endpoint: config.backblaze.endpoint,
  region: config.backblaze.region,
  credentials: {
    accessKeyId: config.backblaze.keyId,
    secretAccessKey: config.backblaze.applicationKey,
  },
  forcePathStyle: true, 
});

export default s3Client;