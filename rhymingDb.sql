
\echo 'Delete and recreate rhyming db?'
\prompt 'Return for yes or control-C to cancel > ' foo

\c rhymingDb 
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_friends CASCADE;

\i rhymingDb-schema.sql
\i rhymingDb-seed.sql

\echo 'Delete and recreate rhymingDb_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE rhymingDb_test;
CREATE DATABASE rhymingDb_test;
\connect rhymingDb_test

\i rhymingDb-schema.sql