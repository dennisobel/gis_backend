import { Router } from "express";
const router = Router();

/** import all controllers */
import {signup, verifyUser, login, getUser, generateOTP,verifyOTP, createResetSession, resetPassword, updateUser} from '../controllers/auth.js';
import { registerMail } from '../controllers/mailer.js'
import Auth, { localVariables } from '../middleware/auth.js';



/** POST Methods */
router.post('/register',signup)
router.post('/registerMail',registerMail)
router.post('/authenticate',verifyUser)
router.post('/login',verifyUser,login)

/** GET Methods */
router.get('/user/:email',getUser)
router.get('/generateOTP',verifyUser, localVariables, generateOTP)
router.get('/verifyOTP',verifyUser, verifyOTP)
router.get('/createResetSession',createResetSession)


/** PUT Methods */
router.put('/updateuser',Auth, updateUser)
router.put('/resetPassword',verifyUser, resetPassword)



export default router;