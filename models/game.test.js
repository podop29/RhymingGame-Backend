"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../helpers/expressError");
const db = require("../db.js");
const Game = require("./game.js");
const User = require("./user.js");


const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
  } = require("./_testCommon.js");

  

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("sendInvite", function(){
    test("works", async function(){
        let user1 = await User.get("u1")
        let user2 = await User.get("u2")

        const invite = await Game.sendInvite(user1.userid,user2.userid)
        console.log(invite)
        expect(invite).toEqual({
            user1_id: 90, 
            user2_id: 91
        })
    })
})
