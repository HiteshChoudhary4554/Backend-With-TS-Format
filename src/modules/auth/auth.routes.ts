import { Router } from 'express';
import type { Router as typeRouter } from 'express';
import { validate } from '../../commom/dto/base.dto.js';
import * as service from './auth.controller.js';
import * as dto from './auth.model.js';
import { upload } from '../../commom/middleware/multer.middleware.js';
import { restrictToAuthenticatedUser } from '../../commom/middleware/auth-middleware.js';

const router: typeRouter = Router();

router.post('/register', upload.single('avatar'), validate(dto.registerSchema), service.register);
router.post('/login', upload.none(), validate(dto.loginSchema), service.login);
router.patch('/verify-email', upload.none(), validate(dto.emailVerifySchema), service.verifyEmail);
router.post(
  '/forget-password',
  upload.none(),
  validate(dto.forgetPasswordSchema),
  service.forgotPassword,
);
router.patch(
  '/reset-password',
  upload.none(),
  validate(dto.resetPasswordSchema),
  service.resetPassword,
);
router.patch('/refresh-token', service.refreshAccessToken);
router.post('/logout', restrictToAuthenticatedUser(), service.logout);
router.get('/me', restrictToAuthenticatedUser(), service.getUserProfile);

export default router;
