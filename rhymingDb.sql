
\echo 'Delete and recreate rhyming db?'
\prompt 'Return for yes or control-C to cancel > ' foo

\c rhymingDb 
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_friends CASCADE;
DROP TABLE IF EXISTS games CASCADE;


\i rhymingDb-schema.sql
\i rhymingDb-seed.sql

\echo 'Delete and recreate rhymingDb_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

\c rhymingDb_test
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_friends CASCADE;
DROP TABLE IF EXISTS games CASCADE;


\i rhymingDb-schema.sql