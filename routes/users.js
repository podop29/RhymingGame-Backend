"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin,ensureLoggedIn, authenticateJWT } = require("../middleware/auth");
const { BadRequestError } = require("../helpers/expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens.js");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, jobs }
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    if(parseInt(req.params.username)){
       const user = await User.getById(req.params.username);
        return res.json({ user });
    }
    else{
      const user = await User.get(req.params.username);
      return res.json({ user });
    }
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

 router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  });
  
  
  /** DELETE /[username]  =>  { deleted: username }
   *
   * Authorization required: admin or same-user-as-:username
   **/
  
  router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  });



  /**Send friend request
   * user1 is logged in user
   * user2 is receiving request
   */
  router.post("/request/:user1/:user2", ensureLoggedIn, async function (req,res,next){
    try{
      await User.sendFriendRequest(req.params.user1, req.params.user2);
      return res.json({Message: `Request sent to ${req.params.user2}`})
    }catch(err){
      return next(err);
    }
  })

  /**See all pending friend requests */
  router.get("/request/:userId", ensureLoggedIn, async function(req,res,next){
    try{
      const requests = await User.seeFriendRequest(req.params.userId)
      return res.json({requests})

    }catch(err){
      return next(err)
    }
  })


  /**Accept friend request */
  router.post("/request/:reqId", ensureLoggedIn, async function(req,res,next){
    try{
      await User.acceptRequest(req.params.reqId);
      return res.json({Message: `Request Accepted`})
    }catch(e){
      return next(e)
    }
  })

  //**See friends list */

  router.get('/friends/:userId', ensureLoggedIn, async function(req,res,next){
    try{
      const friends = await User.seeFriendsList(req.params.userId);
      return res.json({friends})
    }catch(e){
      return next(e)
    }
  })


  //**Delete Friend Request */
  router.delete('/request/:reqId', ensureLoggedIn, async function(req,res,next){
    try{
      const request = await User.deleteRequest(req.params.reqId);
      return res.json({request})
      
    }catch(e){
      return next(e)
    }
  })
  

  module.exports = router;