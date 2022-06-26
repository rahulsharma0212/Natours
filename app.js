const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require(path.join(__dirname, 'routes/tourRoutes.js'));
const userRouter = require(path.join(__dirname, 'routes/userRoutes.js'));
const reviewRouter = require(path.join(__dirname, 'routes/reviewRoutes.js'));
const bookingRouter = require(path.join(__dirname, 'routes/bookingRoutes.js'));
const viewRouter = require(path.join(__dirname, 'routes/viewRoutes.js'));

//Start express app
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Global middleware
// Implemented CORS
app.use(cors());
// Access-Control-Alow-Origin :*
// app.use(
//   cors({
//     origin: 'https://www.natours.com',
//   })
// );
app.options('*', cors());
// app.options('/api/v1/tours/:id',cors());

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTp headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//limit request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour',
});
app.use('/api', limiter);

//Data sanitation against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss
app.use(xss());

//Prevent parameter polluting
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//use compression
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //     console.log('hello from the middleware');
  // console.log(req.cookies);
  next();
});

// app.get('/', (req, res) => {
//     // res.status(200).send("hello from the server side");
//     res
//         .status(200)
//         .json({ message: 'hello from the server side', app: 'natours' });
// });
// app.post('/', (req, res) => {
//     res
//         .status(201)
//         .send('you can post data to this end point');
// });

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //     status: 'fail',
  //     message: `can't find ${req.originalUrl} on this server`
  // })

  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
