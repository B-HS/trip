CREATE TABLE `trip_account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `trip_account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `trip_session_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `trip_user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`username` varchar(255),
	`display_username` text,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_user_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_user_email_unique` UNIQUE(`email`),
	CONSTRAINT `trip_user_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `trip_verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_trip` (
	`id` varchar(36) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`title` varchar(120) NOT NULL,
	`eyebrow` varchar(120),
	`destination` varchar(120) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`period_note` varchar(200),
	`disclaimer` varchar(300),
	`verified_on` date,
	`buffer_policy` text,
	`booking_note` text,
	`footer_note` text,
	`share_slug` varchar(64),
	`is_public` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_trip_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_share_slug_idx` UNIQUE(`share_slug`)
);
--> statement-breakpoint
CREATE TABLE `trip_booking` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`title` varchar(120) NOT NULL,
	`when_label` varchar(120),
	`priority` enum('p1','p2','p3','onsite') NOT NULL DEFAULT 'p2',
	`link_label` varchar(120),
	`link_url` varchar(500),
	`action_note` varchar(200),
	`plan_status` varchar(80),
	CONSTRAINT `trip_booking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_booking_check` (
	`booking_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`checked_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_booking_check_booking_id_user_id_pk` PRIMARY KEY(`booking_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `trip_day` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`day_index` int NOT NULL,
	`date` date NOT NULL,
	`short_label` varchar(40) NOT NULL,
	`title` varchar(120) NOT NULL,
	`subtitle` varchar(200),
	`overview` text,
	`plan_headline` varchar(255),
	`plan_note` text,
	`closing_headline` varchar(255),
	`closing_note` text,
	`morning_summary` varchar(120),
	`afternoon_summary` varchar(120),
	`evening_summary` varchar(120),
	CONSTRAINT `trip_day_id` PRIMARY KEY(`id`),
	CONSTRAINT `day_trip_index_idx` UNIQUE(`trip_id`,`day_index`)
);
--> statement-breakpoint
CREATE TABLE `trip_day_fact` (
	`id` varchar(36) NOT NULL,
	`day_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`label` varchar(80) NOT NULL,
	`value` varchar(255) NOT NULL,
	CONSTRAINT `trip_day_fact_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_day_memo` (
	`day_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`content` text NOT NULL,
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_day_memo_day_id_user_id_pk` PRIMARY KEY(`day_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `trip_day_note` (
	`id` varchar(36) NOT NULL,
	`day_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`leading` text,
	`link_label` varchar(120),
	`link_url` varchar(500),
	`trailing` text,
	CONSTRAINT `trip_day_note_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_flight` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`direction` enum('outbound','inbound') NOT NULL,
	`label` varchar(120) NOT NULL,
	`depart_code` varchar(8) NOT NULL,
	`depart_time` varchar(8) NOT NULL,
	`depart_terminal` varchar(32),
	`arrive_code` varchar(8) NOT NULL,
	`arrive_time` varchar(8) NOT NULL,
	`arrive_terminal` varchar(32),
	`flight_number` varchar(32),
	`note` varchar(200),
	CONSTRAINT `trip_flight_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_info_block` (
	`id` varchar(36) NOT NULL,
	`section_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`kind` enum('paragraph','bullet','heading','day_table') NOT NULL DEFAULT 'paragraph',
	`emphasis` varchar(255),
	`text` text,
	`link_label` varchar(120),
	`link_url` varchar(500),
	CONSTRAINT `trip_info_block_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_info_section` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`title` varchar(120) NOT NULL,
	`is_default_open` boolean NOT NULL DEFAULT false,
	CONSTRAINT `trip_info_section_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_invite` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('owner','editor','viewer') NOT NULL,
	`invited_by` varchar(36) NOT NULL,
	`accepted_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_invite_id` PRIMARY KEY(`id`),
	CONSTRAINT `invite_trip_email_idx` UNIQUE(`trip_id`,`email`)
);
--> statement-breakpoint
CREATE TABLE `trip_lodging` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`name` varchar(160) NOT NULL,
	`name_local` varchar(160),
	`address` varchar(255),
	`access_note` varchar(255),
	`check_in` varchar(8),
	`check_out` varchar(8),
	`url` varchar(500),
	`note` varchar(255),
	CONSTRAINT `trip_lodging_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_member` (
	`trip_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` enum('owner','editor','viewer') NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_member_trip_id_user_id_pk` PRIMARY KEY(`trip_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `trip_route` (
	`id` varchar(36) NOT NULL,
	`day_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`origin` varchar(120) NOT NULL,
	`destination` varchar(120) NOT NULL,
	`minutes` int NOT NULL,
	`path_text` varchar(255),
	`formula` varchar(255),
	CONSTRAINT `trip_route_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_schedule_check` (
	`schedule_item_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`checked_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_schedule_check_schedule_item_id_user_id_pk` PRIMARY KEY(`schedule_item_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `trip_schedule_item` (
	`id` varchar(36) NOT NULL,
	`day_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`time_label` varchar(40) NOT NULL,
	`title` varchar(200) NOT NULL,
	`kind` enum('planned','confirmed','target') NOT NULL DEFAULT 'planned',
	`note` varchar(300),
	`buffer_note` varchar(80),
	`map_query` varchar(200),
	CONSTRAINT `trip_schedule_item_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trip_account` ADD CONSTRAINT `trip_account_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_session` ADD CONSTRAINT `trip_session_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_trip` ADD CONSTRAINT `trip_trip_owner_id_trip_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_booking` ADD CONSTRAINT `trip_booking_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_booking_check` ADD CONSTRAINT `trip_booking_check_booking_id_trip_booking_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `trip_booking`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_booking_check` ADD CONSTRAINT `trip_booking_check_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_day` ADD CONSTRAINT `trip_day_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_day_fact` ADD CONSTRAINT `trip_day_fact_day_id_trip_day_id_fk` FOREIGN KEY (`day_id`) REFERENCES `trip_day`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_day_memo` ADD CONSTRAINT `trip_day_memo_day_id_trip_day_id_fk` FOREIGN KEY (`day_id`) REFERENCES `trip_day`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_day_memo` ADD CONSTRAINT `trip_day_memo_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_day_note` ADD CONSTRAINT `trip_day_note_day_id_trip_day_id_fk` FOREIGN KEY (`day_id`) REFERENCES `trip_day`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_flight` ADD CONSTRAINT `trip_flight_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_info_block` ADD CONSTRAINT `trip_info_block_section_id_trip_info_section_id_fk` FOREIGN KEY (`section_id`) REFERENCES `trip_info_section`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_info_section` ADD CONSTRAINT `trip_info_section_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_invite` ADD CONSTRAINT `trip_invite_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_invite` ADD CONSTRAINT `trip_invite_invited_by_trip_user_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_lodging` ADD CONSTRAINT `trip_lodging_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_member` ADD CONSTRAINT `trip_member_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_member` ADD CONSTRAINT `trip_member_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_route` ADD CONSTRAINT `trip_route_day_id_trip_day_id_fk` FOREIGN KEY (`day_id`) REFERENCES `trip_day`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_schedule_check` ADD CONSTRAINT `trip_schedule_check_schedule_item_id_trip_schedule_item_id_fk` FOREIGN KEY (`schedule_item_id`) REFERENCES `trip_schedule_item`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_schedule_check` ADD CONSTRAINT `trip_schedule_check_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_schedule_item` ADD CONSTRAINT `trip_schedule_item_day_id_trip_day_id_fk` FOREIGN KEY (`day_id`) REFERENCES `trip_day`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `trip_account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `trip_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `trip_verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `trip_owner_id_idx` ON `trip_trip` (`owner_id`);--> statement-breakpoint
CREATE INDEX `booking_trip_id_idx` ON `trip_booking` (`trip_id`);--> statement-breakpoint
CREATE INDEX `booking_check_user_id_idx` ON `trip_booking_check` (`user_id`);--> statement-breakpoint
CREATE INDEX `day_trip_id_idx` ON `trip_day` (`trip_id`);--> statement-breakpoint
CREATE INDEX `day_fact_day_id_idx` ON `trip_day_fact` (`day_id`);--> statement-breakpoint
CREATE INDEX `day_memo_user_id_idx` ON `trip_day_memo` (`user_id`);--> statement-breakpoint
CREATE INDEX `day_note_day_id_idx` ON `trip_day_note` (`day_id`);--> statement-breakpoint
CREATE INDEX `flight_trip_id_idx` ON `trip_flight` (`trip_id`);--> statement-breakpoint
CREATE INDEX `info_block_section_id_idx` ON `trip_info_block` (`section_id`);--> statement-breakpoint
CREATE INDEX `info_section_trip_id_idx` ON `trip_info_section` (`trip_id`);--> statement-breakpoint
CREATE INDEX `invite_email_idx` ON `trip_invite` (`email`);--> statement-breakpoint
CREATE INDEX `lodging_trip_id_idx` ON `trip_lodging` (`trip_id`);--> statement-breakpoint
CREATE INDEX `member_user_id_idx` ON `trip_member` (`user_id`);--> statement-breakpoint
CREATE INDEX `route_day_id_idx` ON `trip_route` (`day_id`);--> statement-breakpoint
CREATE INDEX `schedule_check_user_id_idx` ON `trip_schedule_check` (`user_id`);--> statement-breakpoint
CREATE INDEX `schedule_item_day_id_idx` ON `trip_schedule_item` (`day_id`);