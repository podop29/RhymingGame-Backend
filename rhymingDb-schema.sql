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
    img_url text
);


CREATE TABLE user_friends(
    id Serial PRIMARY KEY,
    user1_id integer Not Null REFERENCES users,
    user2_id integer Not Null REFERENCES users,
    accepted boolean Default FALSE,
    friends_since timestamp without time zone DEFAULT NOW()
);

CREATE TABLE games(
    id Serial Primary Key,
    user1_id integer Not Null REFERENCES users,
    user2_id integer Not Null REFERENCES users,
    accepted boolean Default FALSE,
    user1_score integer,
    user2_score integer,
    round_num integer
)