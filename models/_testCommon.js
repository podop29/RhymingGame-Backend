const bcrypt = require("bcrypt");
const User = require("./user.js");
const Game = require("./game.js");


const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testJobIds = [];

async function commonBeforeAll() {

  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM user_friends");
  await db.query("DELETE FROM games");


  


  await db.query(`
  INSERT INTO users(username, email, password, high_score, level, exp, games_played, is_admin)
  VALUES(
      'u1',
      'test@test.com',
      $1,
      0,
      0,
      0,
      0,
      FALSE
      
  ),
  (
      'u2',
      'testAdmin@test.com',
      $2,
      0,
      0,
      0,
      0,
      TRUE
  
  );`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

      const users = await User.findAll();
      const id1 = users[0].userid;
      const id2 = users[1].userid;

      await db.query(`
      INSERT INTO games(user1_id, user2_id)
      VALUES(
        $1,
        $2
      )`,[id1,id2])

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
};