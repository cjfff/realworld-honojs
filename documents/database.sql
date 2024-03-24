CREATE TABLE `follows` (
  `following_user_id` integer,
  `followed_user_id` integer COMMENT 'the one who is being followed',
  `created_at` timestamp,
  `status` integer COMMENT 'default 0, 1 is following'
);

CREATE TABLE `users` (
  `id` integer PRIMARY KEY,
  `username` varchar(255),
  `role` varchar(255),
  `created_at` timestamp,
  `bio` varchar(255),
  `email` varchar(255),
  `image` varchar(255) COMMENT 'user avatar'
);

CREATE TABLE `article_tag_relations` (
  `tag_id` integer,
  `article_id` integer
);

CREATE TABLE `tags` (
  `id` integer PRIMARY KEY,
  `name` varchar(255),
  `is_deleted` integer
);

CREATE TABLE `article_favorites` (
  `article_id` integer,
  `user_id` integer,
  `favorited` integer COMMENT '0 is false, 1 is true'
);

CREATE TABLE `articles` (
  `id` integer PRIMARY KEY,
  `author` integer,
  `title` varchar(255),
  `body` text COMMENT 'Content of the post',
  `description` varchar(255),
  `slug` varchar(255),
  `createdAt` timestamp,
  `updatedAt` timestamp
);

CREATE TABLE `comments` (
  `id` integer PRIMARY KEY,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  `body` text COMMENT 'Content of the post',
  `author` integer,
  `article_id` integer
);

ALTER TABLE `articles` ADD FOREIGN KEY (`author`) REFERENCES `users` (`id`);

ALTER TABLE `follows` ADD FOREIGN KEY (`following_user_id`) REFERENCES `users` (`id`);

ALTER TABLE `follows` ADD FOREIGN KEY (`followed_user_id`) REFERENCES `users` (`id`);

ALTER TABLE `article_favorites` ADD FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`);

ALTER TABLE `article_favorites` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`author`) REFERENCES `users` (`id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`);

ALTER TABLE `tags` ADD FOREIGN KEY (`id`) REFERENCES `article_tag_relations` (`tag_id`);

ALTER TABLE `articles` ADD FOREIGN KEY (`id`) REFERENCES `article_tag_relations` (`article_id`);
