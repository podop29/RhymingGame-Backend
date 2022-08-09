"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../helpers/expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT username,
                  email,
                  password,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, password,email, isAdmin }) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4)
           RETURNING username, email, is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,
          email,
          isAdmin,
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT userId,
           username,
            email,
            is_admin AS "isAdmin",
            high_score,
            level,
            exp,
            games_played,
            img_url

           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
          `SELECT userId,
                  username,
                  email,
                  is_admin AS "isAdmin",
                  high_score,
                  level,
                  exp,
                  games_played,
                  img_url

           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  static async getById(id) {
    const userRes = await db.query(
          `SELECT userId,
                  username,
                  email,
                  is_admin AS "isAdmin",
                  high_score,
                  level,
                  exp,
                  games_played,
                  img_url

           FROM users
           WHERE userId = $1`,
        [id],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user`);

    return user;
  }

  
  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  //**Send a friend request 
  static async sendFriendRequest(user1, user2){
    if(user1 == user2) throw new BadRequestError(`Cant be friends with yourself`);
    //Dup check
    let duplicateCheck = await db.query(
      `SELECT * FROM user_friends
      where user1_id = $1 AND user2_id = $2 `,[user1,user2]
    )
    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Request already sent`);
    }

    let results = await db.query(
      `INSERT INTO user_friends
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

  //** See Friend Requests */
  //Returns a list of pending friend requests
  static async seeFriendRequest(userId){
    //Selects all requests where userId is receiver and request is pending
    let results = await db.query(
      `SELECT id,
              user1_id,
              user2_id
              accepted,
              friends_since,
              username
      from user_friends f join users u on (f.user1_id = u.userid)
      where f.user2_id = $1 AND f.accepted = false
      `,[userId]
    )
    if(results.rows[0]){
      return results.rows
    }else{
      return [];
    }
  } 


  //**See friends list */
  //Returns list of users that are friends with userId passed in
  static async seeFriendsList(userId){
    let results = await db.query(
      `SELECT username,
              email,
              high_score,
              level,
              games_played,
              img_url,
              id,
              userid
       FROM users u
      JOIN user_friends f ON (f.user1_id = u.userId OR f.user2_id = u.userId)
      WHERE u.userId = f.user2_id AND f.user1_id  = $1 AND accepted = true
      OR  u.userId = f.user1_id AND f.user2_id  = $1 AND accepted = true
      
      `, [userId]) 
      return results.rows
  }

  //**Accept friend request */
  static async acceptRequest(reqId){
      let results = await db.query(
        `UPDATE user_friends
        SET accepted = $1
        WHERE id = $2
        returning *`,[true, reqId]
      )
      if(results.rows[0]){
      return (`Friend request accepted`)
      }else{
      throw new NotFoundError(`No requests found`); 
      }
  }


  //Delete friend request when declined
  // Is also used to delete a friend
  //Returns Undefined*/
  static async deleteRequest(reqId){
    let results = await db.query(
      `DELETE
      FROM user_friends
      WHERE id = $1
      RETURNING *`,[reqId]
    )
    if(results.rows[0]){
      return ("Request Deleted")
    }else{
      throw new NotFoundError(`No requests found`);
    }
  }


  //System for leveling up and gaining xp
  //Returns updated user
  static async addExp(username, exp){
    let user = await User.get(username);
    if(!user) return ("User not found")
    //get current level and exp
    let userLvl = user.level;
    let userExp = user.exp + parseInt(exp);
    //If exp is above (100 * 1.2) * lvl
    //Then level up and do xp - (100 * 1.2) * lvl
    let factor = parseFloat(`1.${userLvl}`);
    let MAX_EXP_FOR_LEVEL = (100 * factor)
    while(userExp > MAX_EXP_FOR_LEVEL){
      userLvl++;
      userExp = Math.floor(userExp - MAX_EXP_FOR_LEVEL)
      factor = parseFloat(`1.${userLvl}`)
      MAX_EXP_FOR_LEVEL = (100 * factor)
    }
    //Update the users level and exp
    await db.query(
        `Update users
        SET
        level = $1,
        exp = $2
        WHERE username = $3
        `,[userLvl, userExp, username]
    )
    return await User.get(username)
  }


   //add 1 to games played count
   //returns nothing
 static async updateLvlAndGameCount(username,score){
      const user = await User.get(username);
      if(score > user.high_score){
        await db.query(`Update users
        SET
        high_score = $1,
        games_played = $2
        WHERE username = $3
        `,[score, user.games_played + 1, username])
      }else{
        await db.query(`Update users
        SET
        games_played = $1
        WHERE username = $2
        `,[user.games_played + 1, username])

      }
    return await User.get(username)


 }


}


module.exports = User;