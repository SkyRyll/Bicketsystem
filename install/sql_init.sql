CREATE DATABASE IF NOT EXISTS bicket;
USE bicket;

DROP TABLE IF EXISTS accounts;
CREATE TABLE IF NOT EXISTS accounts (
    id int NOT NULL AUTO_INCREMENT,
    email varchar(255) NOT NULL,
    firstname varchar(255) NOT NULL,
    lastname varchar(255) NOT NULL,
    username varchar(255) NOT NULL,
    hash varchar(255) NOT NULL,
    PRIMARY KEY (id)
);