DROP DATABASE IF EXISTS simplecode;
CREATE DATABASE simplecode;


\c simplecode;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS profile;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id uuid UNIQUE DEFAULT uuid_generate_v4 (),

  email VARCHAR(128) NOT NULL UNIQUE,
  password VARCHAR(128) NOT NULL,
  registered BIGINT,
  token VARCHAR(128) UNIQUE,
  createdtime BIGINT,
  emailVerified BOOLEAN,
  tokenusedbefore BOOLEAN,
  key VARCHAR(128) UNIQUE,
  period SMALLINT,
  tfa_enabled BOOLEAN,
  resetpasswordtoken VARCHAR(6000) UNIQUE,
  resetpasswordexpires BIGINT,
  resettokenusedbefore BOOLEAN,
  PRIMARY KEY (email)
);


CREATE TABLE profile (
  userID UUID REFERENCES users(id),
  name VARCHAR(128) NOT NULL,
  username VARCHAR(128) NOT NULL,
  unit VARCHAR(128) NOT NULL,
  building VARCHAR(128) NOT NULL,
  street VARCHAR(128) NOT NULL,
  city VARCHAR(128) NOT NULL,
  region VARCHAR(128) NOT NULL,
  country VARCHAR(128) NOT NULL,
  postalCode VARCHAR(128) NOT NULL,
  plan VARCHAR(128) NOT NULL
);