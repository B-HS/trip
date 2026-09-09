CREATE TABLE `trip_destination` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`country_code` varchar(2) NOT NULL,
	`city` varchar(80),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_destination_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_favorite` (
	`user_id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_favorite_user_id_trip_id_pk` PRIMARY KEY(`user_id`,`trip_id`)
);
--> statement-breakpoint
ALTER TABLE `trip_destination` ADD CONSTRAINT `trip_destination_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_favorite` ADD CONSTRAINT `trip_favorite_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trip_favorite` ADD CONSTRAINT `trip_favorite_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `destination_trip_id_idx` ON `trip_destination` (`trip_id`);--> statement-breakpoint
CREATE INDEX `favorite_trip_id_idx` ON `trip_favorite` (`trip_id`);