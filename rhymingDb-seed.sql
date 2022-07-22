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

),
(
    'podop',
    'podop@test.com',
    '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
    312231,
    3,
    444,
    212451,
    FALSE

),
(
    'stevan',
    'stevan@test.com',
    '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
    55,
    31,
    53443,
    211,
    FALSE

);
