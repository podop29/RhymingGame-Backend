\c rhymingDb 

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_friends CASCADE;



CREATE TABLE users (
    userId Serial PRIMARY KEY,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    high_score integer  Default 0,
    level integer Default 0,
    exp integer  Default 0,
    games_played integer Default 0,
    is_admin boolean Default FALSE,
    img_url text Default "https://media.istockphoto.com/vectors/male-profile-flat-blue-simple-icon-with-long-shadow-vector-id522855255?b=1&k=20&m=522855255&s=612x612&w=0&h=hU2lBVV4_3z5K3V-KhnoAausfOx8zcHAgHkHz6sB3Jk="
);


CREATE TABLE user_friends(
    id Serial PRIMARY KEY,
    user1_id integer Not Null REFERENCES users,
    user2_id integer Not Null REFERENCES users,
    accepted boolean Default FALSE,
    friends_since timestamp without time zone DEFAULT NOW()
);

INSERT INTO users(username, email, password, high_score, level, exp, games_played, is_admin)
VALUES(
    'testuser',
    'test@test.com',
    '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
    21421,
    3,
    533,
    21,
    FALSE
),
(
    'testAdmin',
    'testAdmin@test.com',
    '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
    21421,
    3,
    533,
    21,
    TRUE

);

