CREATE TABLE `trip_developer_api_token` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`token_prefix` varchar(32) NOT NULL,
	`token_last4` varchar(4) NOT NULL,
	`label` varchar(80) NOT NULL,
	`scopes` json NOT NULL,
	`expires_at` timestamp(3),
	`last_used_at` timestamp(3),
	`revoked_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_developer_api_token_id` PRIMARY KEY(`id`),
	CONSTRAINT `developer_api_token_hash_idx` UNIQUE(`token_hash`)
);
--> statement-breakpoint
ALTER TABLE `trip_developer_api_token` ADD CONSTRAINT `trip_developer_api_token_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `developer_api_token_user_id_idx` ON `trip_developer_api_token` (`user_id`);
--> statement-breakpoint
CREATE INDEX `developer_api_token_active_idx` ON `trip_developer_api_token` (`user_id`,`revoked_at`);
