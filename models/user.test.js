"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../helpers/expressError");
const db = require("../db.js");
const User = require("./user.js");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
  } = require("./_testCommon.js");
const { seeFriendRequest } = require("./user.js");
  

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
    test("works", async function () {
      const user = await User.authenticate("u1", "password1");
      console.log(user)
      expect(user).toEqual({
		username: "u1",
		email: "test@test.com",
		isAdmin: false
      });
    });
  
    test("unauth if no such user", async function () {
      try {
        await User.authenticate("nope", "password");
        fail();
      } catch (err) {
        expect(err instanceof UnauthorizedError).toBeTruthy();
      }
    });
  
    test("unauth if wrong password", async function () {
      try {
        await User.authenticate("c1", "wrong");
        fail();
      } catch (err) {
        expect(err instanceof UnauthorizedError).toBeTruthy();
      }
    });
  });

  /************************************** register */

describe("register", function () {
  const newUser = {
    "username": "new",
    "email": "podop@gmail.com",
    "isAdmin": false
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual(newUser);
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
      isAdmin: true,
    });
    expect(user).toEqual({ ...newUser, isAdmin: true });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    let ids = [];
    users.map((user)=>{
      ids.push(user.userid)
    })
    expect(users).toEqual([
      {
        username: "u1",
        userid: ids[0],
        email: "test@test.com",
        isAdmin: false,
        high_score: 0,
        level: 0,
        exp: 0,
        games_played:0,
        img_url: null
      },
      {
        username: "u2",
        userid: ids[1],
        email: "testAdmin@test.com",
        isAdmin: true,
        high_score: 0,
        level: 0,
        exp: 0,
        games_played:0,
        img_url: null
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let user = await User.get("u1");
    expect(user).toEqual({
      username: "u1",
        userid: user.userid,
        email: "test@test.com",
        isAdmin: false,
        high_score: 0,
        level: 0,
        exp: 0,
        games_played:0,
        img_url: null
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
/************************************** getById */

describe("getById", function () {
  test("works", async function () {
    let user = await User.get("u1");

    user = await User.getById(user.userid);
    expect(user).toEqual({
      username: "u1",
        userid: user.userid,
        email: "test@test.com",
        isAdmin: false,
        high_score: 0,
        level: 0,
        exp: 0,
        games_played:0,
        img_url: null
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await User.remove("u1");
    const res = await db.query(
        "SELECT * FROM users WHERE username='u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****************************************Send friend Request */
describe("send friend request", function (){
  test("Works", async function (){
    const users = await User.findAll();
    let results = await User.sendFriendRequest(users[0].userid,users[1].userid)
    expect(results).toEqual({
      user1_id: users[0].userid,
      user2_id:users[1].userid
    })
  })

  test("Dup request", async function (){
    const users = await User.findAll();
    await User.sendFriendRequest(users[0].userid,users[1].userid)
    try{
    await User.sendFriendRequest(users[0].userid,users[1].userid)
    fail()
    }catch(e){
      expect(e instanceof BadRequestError).toBeTruthy()
    }
  })

  test("Bad request with dup user_id", async function (){
    try{
      const users = await User.findAll();
      await User.sendFriendRequest(users[0].userid,users[0].userid)
      fail()
    }catch(e){
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  })
})

/**********************************See friend Requests */
describe("See Friend Requests",function (){
  test("See all friend requests", async function(){
    const users = await User.findAll();
    await User.sendFriendRequest(users[0].userid,users[1].userid)
    let results = await User.seeFriendRequest(users[1].userid)
    expect(results.length).toEqual(1)
    expect(results).toEqual([{
      "id": results[0].id,
			"user1_id": users[0].userid,
			"user2_id": users[1].userid,
			"accepted": false,
			"friends_since": results[0].friends_since
    }])
  })
})

//**Accept Friend Request */

describe("accept Friend Requests",function (){
  test("Accept Friend Request", async function(){
    const users = await User.findAll();
    await User.sendFriendRequest(users[0].userid,users[1].userid)
    let request = await User.seeFriendRequest(users[1].userid)
    expect(request.length).toEqual(1)

    //Accept the Request
    try{
      await User.acceptRequest(request[0].id)
      await User.seeFriendRequest(users[1].userid)
      fail();
    }catch(e){
      expect(e instanceof NotFoundError).toBeTruthy()
    }
  })
})

//**********************See friends list */
describe("See friends list",function (){
  test("Works", async function(){
    const users = await User.findAll();
    await User.sendFriendRequest(users[0].userid,users[1].userid)
    let request = await User.seeFriendRequest(users[1].userid)
    await User.acceptRequest(request[0].id)
    //See for user 1
    let list = await User.seeFriendsList(users[1].userid)
    expect(list[0]).toEqual({
        username: 'u1',
        email: 'test@test.com',
        high_score: 0,
        level: 0,
        games_played: 0
    })
    list = await User.seeFriendsList(users[0].userid)
    expect(list[0]).toEqual({
        username: 'u2',
        email: 'testAdmin@test.com',
        high_score: 0,
        level: 0,
        games_played: 0
    })
  })
})


//**********************DELETES FRIEND REQUESTS */
describe("delete friend request",function (){
  test("Works", async function(){
    const users = await User.findAll();
    await User.sendFriendRequest(users[0].userid,users[1].userid)
    let request = await User.seeFriendRequest(users[1].userid)
    expect(request.length).toEqual(1);

    try{
      User.deleteRequest(request[0].id)
    await User.seeFriendRequest(users[1].userid)
    fail()
    }catch(e){
      expect(e instanceof NotFoundError).toBeTruthy()
    }
    
  })

  test("no request found", async function(){
    try{
      await User.deleteRequest(1)
    fail()
    }catch(e){
      expect(e instanceof NotFoundError).toBeTruthy()
    }

  })
})


//*************************Test adding xp and levels */

describe("Adding levels and xp",function (){
  test("Works", async function(){
    let user = await User.get("u1");
    expect(user.level).toEqual(0)
    expect(user.exp).toEqual(0)

    await User.addExp("u1", 101)
    user = await User.get("u1");
    expect(user.level).toEqual(1)
    expect(user.exp).toEqual(1)

    await User.addExp("u1", 110)
    user = await User.get("u1");
    expect(user.level).toEqual(2)
    expect(user.exp).toEqual(0)
 
  })
})


//***************Testing changing highscore and gamesplay */

describe("testing highscore and games played updater",function (){
  test("Works", async function(){
    let user = await User.get("u1");
    expect(user.high_score).toEqual(0)
    expect(user.games_played).toEqual(0)

    await User.updateLvlAndGameCount("u1", 200)
    user = await User.get("u1");
    expect(user.high_score).toEqual(200)
    expect(user.games_played).toEqual(1)

    await User.updateLvlAndGameCount("u1", 150)
    user = await User.get("u1");
    expect(user.high_score).toEqual(200)
    expect(user.games_played).toEqual(2)

    
 
  })
})