const express = require('express');
let cors = require('cors')
const { NotFoundError } = require("./helpers/expressError");
const { authenticateJWT } = require("./middleware/auth");

const app = express();


app.use(cors())
app.use(express.json());
app.use(authenticateJWT);


//const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const authRouters = require('./routes/auth')
const gameRoutes = require('./routes/game')


//app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRouters);
app.use('/game', gameRoutes);






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