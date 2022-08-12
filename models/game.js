"use strict";

const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../helpers/expressError");
const user = require("./user")


/** Related functions for Games. */

class Game {
    
    /**Sends a game invite from user1_id to  user2_id*/
    static async sendInvite(user1, user2){
        //Cant send invite to yourself
        if(user1 == user2) throw new BadRequestError(`Cant play game with yourself`);
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
              round_num,
              game_over

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

  //**Gets game by gameid */
  static async getGame(gameId){
    let res = await db.query(`SELECT 
              id,
              u1.username as username1,
              u2.username as username2,
              user1_id,
              user2_id,
              accepted,
              user1_score,
              user2_score,
              round_num ,
              game_over
            FROM games g
            join users as u1 on (g.user1_id = u1.userid)
            join users as u2 on (g.user2_id = u2.userid)
            where id = $1`,[gameId])

            return res.rows[0]
  }

  //Gets recent 10 finished games for a player
  static async getAllFinishedGames(playerId){
      let res = await db.query(`
      SELECT 
              id,
              u1.username as username1,
              u2.username as username2,
              user1_id,
              user2_id,
              accepted,
              user1_score,
              user2_score,
              round_num,
              game_over
      FROM games g
      join users as u1 on (g.user1_id = u1.userid)
      join users as u2 on (g.user2_id = u2.userid)
      WHERE user1_id = $1 or user2_id = $1 and game_over = true
      ORDER BY id desc LIMIT 10
   `,[playerId])
  return res.rows

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
    let game = await this.getGame(gameId)
    //Get current round number and update
    //Get currScore and update
    let round = game.round_num
    let prevScore = 0;
    let results;
    let user1 = game.username1
    let user2 = game.username2


    if(round % 2 !== 1){
         prevScore = game.user1_score
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
         prevScore = game.user2_score
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

    //If rounds are 7 or over, end game and award
    if(round >= 7){
      results = await db.query(
        `Update Games
        SET
        game_over = True
        WHERE id = $1
        RETURNING *
        `,[gameId])

        await user.addExp(user1, 220)
        await user.addExp(user2, 220)
        await user.updateLvlAndGameCount(user1, game.user1_score)
        await user.updateLvlAndGameCount(user2, game.user2_score)

    }
        return results.rows[0]
  }

 


}



module.exports = Game;

