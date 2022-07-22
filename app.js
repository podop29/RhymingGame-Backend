const express = require('express');
const ExpressError = require("./helpers/expressError");
const { NotFoundError } = require("./helpers/expressError");
const { authenticateJWT } = require("./middleware/auth");

const app = express();



app.use(express.json());
app.use(authenticateJWT);


//const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const authRouters = require('./routes/auth')


//app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRouters);





/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});
  
  module.exports = app;