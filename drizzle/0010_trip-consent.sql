CREATE TABLE `trip_user_consent` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`document` varchar(32) NOT NULL,
	`version` varchar(32) NOT NULL,
	`accepted_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_user_consent_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_consent_user_document_version_idx` UNIQUE(`user_id`,`document`,`version`)
);
--> statement-breakpoint
ALTER TABLE `trip_user_consent` ADD CONSTRAINT `trip_user_consent_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_consent_user_id_idx` ON `trip_user_consent` (`user_id`);