import { Router } from "express";
const router = Router();

/** import all controllers */
<<<<<<< HEAD
import {signup, verifyUser, login, getUser, getUsers, generateOTP,verifyOTP, createResetSession, resetPassword, updateUser} from '../controllers/auth.js';
=======
import {signup, verifyUser, login, getUser, generateOTP,verifyOTP, createResetSession, resetPassword, updateUser} from '../controllers/auth.js';
>>>>>>> dd41544324a5e1ec6ef7dff4f50d09e9d1f19836
import { registerMail } from '../controllers/mailer.js'
import Auth, { localVariables } from '../middleware/auth.js';



/** POST Methods */
router.post('/register',signup)
router.post('/registerMail',registerMail)
router.post('/authenticate',verifyUser)
router.post('/login',verifyUser,login)
router.post('/generateOTP', generateOTP)

/** GET Methods */
router.get('/user/:email',getUser)
<<<<<<< HEAD
router.get('/users',getUsers)
=======
>>>>>>> dd41544324a5e1ec6ef7dff4f50d09e9d1f19836
router.get('/verifyOTP', verifyOTP)
router.get('/createResetSession',createResetSession)


/** PUT Methods */
router.put('/updateuser',Auth, updateUser)
router.put('/resetPassword',verifyUser, resetPassword)



export default router;