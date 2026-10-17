import express from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { uploadPdf } from '../../shared/middleware/upload.middleware.js';
import {
  uploadMaterialItem,
  getMaterialItems,
  getMaterialItem,
  deleteMaterialItem,
} from './material.controller.js';

const router = express.Router();

router.use(authenticate);

router.post('/', uploadPdf, uploadMaterialItem);
router.get('/', getMaterialItems);
router.get('/:id', getMaterialItem);
router.delete('/:id', deleteMaterialItem);

export default router;
