DROP DATABASE IF EXISTS bicket;
CREATE DATABASE IF NOT EXISTS bicket;
USE bicket;

CREATE TABLE accounts (
  account_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  role_id INT,
  email VARCHAR(256),
  first_name VARCHAR(256),
  last_name VARCHAR(256),
  street VARCHAR(256),
  house_number VARCHAR(256),
  zip_code INT,
  city VARCHAR(256),
  hash VARCHAR(256),
  FOREIGN KEY (role_id) REFERENCES roles (role_id)
);

CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  role_type VARCHAR(256)
);

CREATE TABLE rooms (
  room_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  room_name VARCHAR(8)
);

CREATE TABLE tickets (
  ticket_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  room_id INT,
  creation_date DATETIME,
  ticket_title VARCHAR(256),
  ticket_description VARCHAR(2048),
  ticket_status INT,
  FOREIGN KEY (room_id) REFERENCES rooms (room_id)
);

INSERT INTO roles (role_type) VALUES
('Teacher'),
('Room attendant');

INSERT INTO rooms (room_name) VALUES
('A0.01'),
('A0.02'),
('A0.03'),
('B0.01'),
('B0.02'),
('B0.03'),
('A1.01'),
('A1.02'),
('A1.03'),
('B1.01'),
('B1.02'),
('B1.03');
