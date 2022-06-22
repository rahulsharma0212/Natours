const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

//protect all routes after this middleware
router.use(authController.protect);

router.route('/updateMyPassword').patch(authController.updatePassword);
router.route('/me').get(userController.getMe, userController.getUser);
router.route('/updateMe').patch(userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);

//restrict all the operation to admins after this
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.removePasswordFromBody, userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
