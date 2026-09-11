CREATE TABLE `trip_report` (
	`id` varchar(36) NOT NULL,
	`reporter_id` varchar(36) NOT NULL,
	`kind` enum('post','comment','user') NOT NULL,
	`target_id` varchar(36) NOT NULL,
	`reason` enum('spam','harassment','obscenity','defamation','illegal','privacy','other') NOT NULL,
	`memo` varchar(500),
	`status` enum('open','hidden','dismissed','banned') NOT NULL DEFAULT 'open',
	`handled_by` varchar(36),
	`handled_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_report_id` PRIMARY KEY(`id`),
	CONSTRAINT `report_reporter_kind_target_idx` UNIQUE(`reporter_id`,`kind`,`target_id`)
);
--> statement-breakpoint
CREATE TABLE `trip_user_block` (
	`blocker_id` varchar(36) NOT NULL,
	`blocked_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_user_block_blocker_id_blocked_id_pk` PRIMARY KEY(`blocker_id`,`blocked_id`)
);
--> statement-breakpoint
ALTER TABLE `trip_point_ledger` MODIFY COLUMN `reason` enum('answer','accepted','revoked') NOT NULL;--> statement-breakpoint
ALTER TABLE `trip_comment` ADD `deleted_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `trip_post` ADD `deleted_at` timestamp(3);--> statement-breakpoint
ALTER TABLE `trip_report` ADD CONSTRAINT `trip_report_reporter_id_trip_user_id_fk` FOREIGN KEY (`reporter_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_report` ADD CONSTRAINT `trip_report_handled_by_trip_user_id_fk` FOREIGN KEY (`handled_by`) REFERENCES `trip_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_user_block` ADD CONSTRAINT `trip_user_block_blocker_id_trip_user_id_fk` FOREIGN KEY (`blocker_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_user_block` ADD CONSTRAINT `trip_user_block_blocked_id_trip_user_id_fk` FOREIGN KEY (`blocked_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `report_status_created_at_idx` ON `trip_report` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `user_block_blocked_id_idx` ON `trip_user_block` (`blocked_id`);