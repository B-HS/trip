CREATE TABLE `trip_sidebar_link` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`label` varchar(80) NOT NULL,
	`url` varchar(500) NOT NULL,
	`description` varchar(200),
	CONSTRAINT `trip_sidebar_link_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trip_trip` ADD `sidebar_note` text;--> statement-breakpoint
ALTER TABLE `trip_sidebar_link` ADD CONSTRAINT `trip_sidebar_link_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sidebar_link_trip_id_idx` ON `trip_sidebar_link` (`trip_id`);