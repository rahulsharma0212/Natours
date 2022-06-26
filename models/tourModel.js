const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy,medium,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc on new document creation
          return val < this.price;
        },
        message: 'Discount price {{VALUE}} must be less then the price itself',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trime: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a Cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourschema.index({ price: 1, ratingsAverage: -1 });
tourschema.index({ slug: 1 });
tourschema.index({ startLocation: '2dsphere' });

tourschema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual Populate
tourschema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//Document middleware : runs before .save() and .create()
tourschema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Embedding user in tour model (only work while saving new tour not in case of updating tour)
// tourschema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourschema.pre('save', function (next) {
//     console.log('will save document........');
//     next();
// });

// tourschema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });

//QUERY MIDDLEWARE
tourschema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourschema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});
/* tourschema.post(/^find/, function (doc, next) {
  console.log(`Query tooks ${Date.now() - this.start} milliseconds!`);
  // console.log(doc);
  next();
}); */

//AGGEREGATION MIDDLEWARE
// tourschema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourschema);

module.exports = Tour;
