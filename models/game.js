"use strict";

const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../helpers/expressError");


/** Related functions for Games. */

class Game {
    
    /**Sends a game invite from user1_id to  user2_id*/
    static async sendInvite(user1, user2){
        //Cant send invite to yourself
        if(user1 == user2) throw new BadRequestError(`Cant play game with yourself`);
        //Duplicate Check
        let duplicateCheck = await db.query(
            `SELECT * FROM games
            where user1_id = $1 AND user2_id = $2 `,[user1,user2]
          )
          if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Request already sent`);
          }

          //Inserts into database
          let results = await db.query(
            `INSERT INTO games
            (
              user1_id,
              user2_id
            )
            VALUES ($1, $2)
            RETURNING user1_id, user2_id
            `,[user1, user2]
          )
          return results.rows[0]
    }

    //** See Game Requests */
  //Returns a list of pending friendGame requests
  static async seeGameRequest(userId){
    //Selects all requests where userId is present
    let results = await db.query(
      `SELECT id,
              u1.username as username1,
              u2.username as username2,
              user1_id,
              user2_id,
              accepted,
              user1_score,
              user2_score,
              round_num

      from games g 
      join users as u1 on (g.user1_id = u1.userid)
      join users as u2 on (g.user2_id = u2.userid)
  
      where g.user2_id = $1 Or g.user1_id = $1
      `,[userId]
    )
    if(results.rows[0]){
      return results.rows
    }else{
      return [];
    }
  } 

//**Accept game request */
static async acceptRequest(reqId){
    let results = await db.query(
      `UPDATE games
      SET accepted = $1
      WHERE id = $2
      returning *`,[true, reqId]
    )
    if(results.rows[0]){
    return (`game request accepted`)
    }else{
    throw new NotFoundError(`No requests found`); 
    }
}

//Decline game request*/
  static async deleteRequest(reqId){
    let results = await db.query(
      `DELETE
      FROM games
      WHERE id = $1
      RETURNING *`,[reqId]
    )
    if(results.rows[0]){
      return ("Request Deleted")
    }else{
      throw new NotFoundError(`No requests found`);
    }
  }

  /**Updates score and round number after every round */
  //If round number is odd its user1 turn
  static async updateScore(gameId,score){
    let game = await db.query(
        `SELECT *
        FROM GAMES
        WHERE id = $1`,[gameId]
    )
    //Get current round number and update
    //Get currScore and update
    let round = game.rows[0].round_num
    let prevScore = 0;
    let results;
    if(round % 2 === 1){
         prevScore = game.rows[0].user1_score
            results = await db.query(
            `Update Games
            SET
            user1_score = $1,
            round_num = $2
            WHERE id = $3
            RETURNING 
            id,
            user1_score,
            user2_score,
            round_num
            `,[prevScore += score, round+=1, gameId])
    }else{
         prevScore = game.rows[0].user2_score
            results = await db.query(
            `Update Games
            SET
            user2_score = $1,
            round_num = $2
            WHERE id = $3
            RETURNING 
            id,
            user1_score,
            user2_score,
            round_num
            `,[prevScore += score, round+=1, gameId])
    }
        return results.rows[0]
  }

 


}



module.exports = Game;

