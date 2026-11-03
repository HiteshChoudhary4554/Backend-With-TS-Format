import { Router } from 'express';
import type { Router as typeRouter } from 'express';
import { restrictToAuthenticatedUser } from '../../commom/middleware/auth-middleware.js';
import { getAllStudents } from './class.controller.js';
import { roleAuthorized } from '../../commom/middleware/auth.role.js';

const router: typeRouter = Router();

router.get('/all-students', roleAuthorized('admin'), restrictToAuthenticatedUser(), getAllStudents);
export default router;
