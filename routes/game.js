"use strict";

/** Routes for game. */


const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin,ensureLoggedIn, authenticateJWT } = require("../middleware/auth");
const { BadRequestError } = require("../helpers/expressError");
const Game = require("../models/game");

const router = express.Router();

 /**Send game request
   * user1 is logged in user
   * user2 is receiving request
   */
  router.post("/request/:user1/:user2", ensureLoggedIn, async function (req,res,next){
    try{
      await Game.sendInvite(req.params.user1, req.params.user2);
      return res.json({Message: `Request sent to ${req.params.user2}`})
    }catch(err){
      return next(err);
    }
  })

  /**See all pending game requests */
  router.get("/request/:userId", ensureLoggedIn, async function(req,res,next){
    try{
      const requests = await Game.seeGameRequest(req.params.userId)
      return res.json({requests})

    }catch(err){
      return next(err)
    }
  })

  /**Accept game request */
  router.post("/request/:reqId", ensureLoggedIn, async function(req,res,next){
    try{
      await Game.acceptRequest(req.params.reqId);
      return res.json({Message: `Request Accepted`})
    }catch(e){
      return next(e)
    }
  })

  //**Delete Friend Request */
  router.delete('/request/:reqId', ensureLoggedIn, async function(req,res,next){
    try{
      const request = await Game.deleteRequest(req.params.reqId);
      return res.json({request})
      
    }catch(e){
      return next(e)
    }
  })



  /**Updates the user scores and round number after a round */
   router.patch('/update/:gameId/:score', ensureLoggedIn, async function(req,res,next){
    try{
      const request = await Game.updateScore(req.params.gameId, parseInt(req.params.score))
      return res.json({request})
    }catch(e){
      return next(e);
    }
  })



  module.exports = router;

