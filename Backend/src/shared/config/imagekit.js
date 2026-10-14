import ImageKit from 'imagekit';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Normalizes an ImageKit URL endpoint.
 * Handles trailing slashes, missing protocols, or bare identifiers cleanly.
 */
const normalizeUrlEndpoint = (url) => {
  if (!url) return '';
  let trimmed = url.trim();

  // If user passed bare identifier like 'ufnhisesq'
  if (!trimmed.includes('.') && !trimmed.startsWith('http')) {
    trimmed = `https://ik.imagekit.io/${trimmed}`;
  } else if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  // Remove trailing slashes for standard SDK compliance
  return trimmed.replace(/\/+$/, '');
};

export const isImageKitConfigured = () => {
  const pub = env.IMAGEKIT_PUBLIC_KEY;
  const priv = env.IMAGEKIT_PRIVATE_KEY;
  const endpoint = env.IMAGEKIT_URL_ENDPOINT;

  return Boolean(
    pub &&
    priv &&
    endpoint &&
    !pub.includes('your_imagekit') &&
    !priv.includes('your_imagekit') &&
    !endpoint.includes('your_imagekit')
  );
};

let imagekitInstance = null;

export const getImageKitInstance = () => {
  if (!isImageKitConfigured()) {
    const error = new Error(
      'ImageKit credentials are not properly configured. Please verify IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in Backend/.env.'
    );
    error.statusCode = 503;
    throw error;
  }

  if (!imagekitInstance) {
    try {
      imagekitInstance = new ImageKit({
        publicKey: env.IMAGEKIT_PUBLIC_KEY.trim(),
        privateKey: env.IMAGEKIT_PRIVATE_KEY.trim(),
        urlEndpoint: normalizeUrlEndpoint(env.IMAGEKIT_URL_ENDPOINT),
      });
      logger.info('ImageKit client initialized successfully.');
    } catch (err) {
      logger.error('Failed to initialize ImageKit client:', err);
      throw err;
    }
  }

  return imagekitInstance;
};
