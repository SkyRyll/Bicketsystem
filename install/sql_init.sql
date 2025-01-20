DROP DATABASE IF EXISTS bicket;
CREATE DATABASE IF NOT EXISTS bicket;
USE bicket;

CREATE TABLE `accounts` (
  `account_id` integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `role_id` integer,
  `email` varchar(255),
  `first_name` varchar(255),
  `last_name` varchar(255),
  `street` varchar(255),
  `house_number` varchar(255),
  `zip_code` integer,
  `city` varchar(255),
  `hash` varchar(255)
);

CREATE TABLE `roles` (
  `role_id` integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `role_type` varchar(256)
);

CREATE TABLE `rooms` (
  `room_id` integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `room_name` varchar(255)
);

CREATE TABLE `tickets` (
  `ticket_id` integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `room_id` integer,
  `creation_date` datetime,
  `ticket_title` varchar(255),
  `ticket_description` varchar(255),
  `ticket_status` integer
);

ALTER TABLE `tickets` ADD FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`);

ALTER TABLE `accounts` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);


INSERT INTO `roles` (role_type) VALUES
("Teacher"),
("Room attendant");

INSERT INTO `rooms` (`room_name`) VALUES
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
