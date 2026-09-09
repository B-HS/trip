CREATE TABLE `trip_booking_attachment` (
	`id` varchar(36) NOT NULL,
	`booking_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`kind` enum('image','link') NOT NULL DEFAULT 'link',
	`url` varchar(500) NOT NULL,
	`label` varchar(80),
	`upload_id` varchar(36),
	`created_by` varchar(36),
	CONSTRAINT `trip_booking_attachment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_upload` (
	`id` varchar(36) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`kind` enum('booking','avatar','banner','post') NOT NULL,
	`key` varchar(300) NOT NULL,
	`url` varchar(500) NOT NULL,
	`mime` varchar(80) NOT NULL,
	`size` int NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_upload_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trip_booking_attachment` ADD CONSTRAINT `trip_booking_attachment_booking_id_trip_booking_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `trip_booking`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_booking_attachment` ADD CONSTRAINT `trip_booking_attachment_upload_id_trip_upload_id_fk` FOREIGN KEY (`upload_id`) REFERENCES `trip_upload`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_upload` ADD CONSTRAINT `trip_upload_owner_id_trip_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `booking_attachment_booking_id_idx` ON `trip_booking_attachment` (`booking_id`);--> statement-breakpoint
CREATE INDEX `booking_attachment_upload_id_idx` ON `trip_booking_attachment` (`upload_id`);--> statement-breakpoint
CREATE INDEX `upload_owner_id_idx` ON `trip_upload` (`owner_id`);