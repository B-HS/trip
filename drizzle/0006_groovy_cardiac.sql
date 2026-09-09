CREATE TABLE `trip_board` (
	`id` varchar(36) NOT NULL,
	`key` varchar(40) NOT NULL,
	`name` varchar(40) NOT NULL,
	`kind` enum('free','qna','review') NOT NULL,
	`description` varchar(200),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_board_id` PRIMARY KEY(`id`),
	CONSTRAINT `board_key_idx` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `trip_comment` (
	`id` varchar(36) NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`author_id` varchar(36) NOT NULL,
	`parent_id` varchar(36),
	`body` text NOT NULL,
	`is_accepted` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_comment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_like` (
	`user_id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_like_user_id_trip_id_pk` PRIMARY KEY(`user_id`,`trip_id`)
);
--> statement-breakpoint
CREATE TABLE `trip_point_ledger` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`delta` int NOT NULL,
	`reason` enum('answer','accepted') NOT NULL,
	`ref_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_point_ledger_id` PRIMARY KEY(`id`),
	CONSTRAINT `point_ledger_user_reason_ref_idx` UNIQUE(`user_id`,`reason`,`ref_id`)
);
--> statement-breakpoint
CREATE TABLE `trip_post` (
	`id` varchar(36) NOT NULL,
	`board_id` varchar(36) NOT NULL,
	`author_id` varchar(36) NOT NULL,
	`title` varchar(120) NOT NULL,
	`body` json NOT NULL,
	`excerpt` varchar(300) NOT NULL,
	`trip_id` varchar(36),
	`view_count` int NOT NULL DEFAULT 0,
	`like_count` int NOT NULL DEFAULT 0,
	`comment_count` int NOT NULL DEFAULT 0,
	`accepted_comment_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_post_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_post_like` (
	`user_id` varchar(36) NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_post_like_user_id_post_id_pk` PRIMARY KEY(`user_id`,`post_id`)
);
--> statement-breakpoint
ALTER TABLE `trip_session` ADD `impersonated_by` varchar(36);--> statement-breakpoint
ALTER TABLE `trip_user` ADD `role` varchar(32) DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `trip_user` ADD `banned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `trip_user` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `trip_user` ADD `ban_expires` timestamp(3);--> statement-breakpoint
ALTER TABLE `trip_user` ADD `bio` varchar(300);--> statement-breakpoint
ALTER TABLE `trip_user` ADD `banner_url` varchar(500);--> statement-breakpoint
ALTER TABLE `trip_user` ADD `banner_upload_id` varchar(36);--> statement-breakpoint
ALTER TABLE `trip_trip` ADD `like_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `trip_comment` ADD CONSTRAINT `trip_comment_post_id_trip_post_id_fk` FOREIGN KEY (`post_id`) REFERENCES `trip_post`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_comment` ADD CONSTRAINT `trip_comment_author_id_trip_user_id_fk` FOREIGN KEY (`author_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_comment` ADD CONSTRAINT `trip_comment_parent_id_trip_comment_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `trip_comment`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_like` ADD CONSTRAINT `trip_like_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_like` ADD CONSTRAINT `trip_like_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_point_ledger` ADD CONSTRAINT `trip_point_ledger_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_post` ADD CONSTRAINT `trip_post_board_id_trip_board_id_fk` FOREIGN KEY (`board_id`) REFERENCES `trip_board`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_post` ADD CONSTRAINT `trip_post_author_id_trip_user_id_fk` FOREIGN KEY (`author_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_post` ADD CONSTRAINT `trip_post_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_post_like` ADD CONSTRAINT `trip_post_like_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_post_like` ADD CONSTRAINT `trip_post_like_post_id_trip_post_id_fk` FOREIGN KEY (`post_id`) REFERENCES `trip_post`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `comment_post_id_idx` ON `trip_comment` (`post_id`);--> statement-breakpoint
CREATE INDEX `comment_author_id_idx` ON `trip_comment` (`author_id`);--> statement-breakpoint
CREATE INDEX `like_trip_id_idx` ON `trip_like` (`trip_id`);--> statement-breakpoint
CREATE INDEX `post_board_created_at_idx` ON `trip_post` (`board_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `post_author_id_idx` ON `trip_post` (`author_id`);--> statement-breakpoint
CREATE INDEX `post_trip_id_idx` ON `trip_post` (`trip_id`);--> statement-breakpoint
CREATE INDEX `post_like_post_id_idx` ON `trip_post_like` (`post_id`);--> statement-breakpoint
ALTER TABLE `trip_user` ADD CONSTRAINT `trip_user_banner_upload_id_trip_upload_id_fk` FOREIGN KEY (`banner_upload_id`) REFERENCES `trip_upload`(`id`) ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
INSERT INTO `trip_board` (`id`, `key`, `name`, `kind`, `description`, `sort_order`) VALUES ('fe7837bb-0f4e-4eb7-9c17-8b0c99ca9520', 'free', '자유게시판', 'free', '여행 이야기를 자유롭게 나누는 공간입니다.', 0);
--> statement-breakpoint
INSERT INTO `trip_board` (`id`, `key`, `name`, `kind`, `description`, `sort_order`) VALUES ('927f0e2b-cc33-4e77-b5c2-a2e5b1420e0f', 'qna', '질문게시판', 'qna', '여행 준비 중 궁금한 점을 물어보세요.', 1);
--> statement-breakpoint
INSERT INTO `trip_board` (`id`, `key`, `name`, `kind`, `description`, `sort_order`) VALUES ('3f624b16-c592-4a5e-a9f0-904cd610a53f', 'review', '여행 후기', 'review', '다녀온 여행의 후기를 남겨 주세요.', 2);
