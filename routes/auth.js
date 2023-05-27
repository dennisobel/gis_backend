import { Router } from "express";
const router = Router();

/** import all controllers */
import {signup, verifyUser, login, getUser, getUsers, getOfficers, generateOTP,verifyOTP, createResetSession, resetPassword, updateUser} from '../controllers/auth.js';
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
router.get('/users',getUsers)
router.get('/officers/:county/:role',getOfficers)
router.get('/verifyOTP', verifyOTP)
router.get('/createResetSession',createResetSession)


/** PUT Methods */
router.put('/updateuser',Auth, updateUser)
router.put('/resetPassword',verifyUser, resetPassword)



export default router;