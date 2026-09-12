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
--> statement-breakpoint
CREATE TABLE `trip_developer_api_idempotency` (
	`token_id` varchar(36) NOT NULL,
	`idempotency_key` varchar(255) NOT NULL,
	`request_hash` varchar(64) NOT NULL,
	`claim_nonce` varchar(36) NOT NULL,
	`status` enum('processing','completed') NOT NULL DEFAULT 'processing',
	`response` json,
	`response_status` int,
	`response_headers` json,
	`claimed_at` timestamp(3) NOT NULL DEFAULT (now()),
	`completed_at` timestamp(3),
	CONSTRAINT `trip_developer_api_idempotency_token_id_idempotency_key_pk` PRIMARY KEY(`token_id`,`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `trip_developer_api_rate_limit` (
	`token_id` varchar(36) NOT NULL,
	`bucket` enum('read','write') NOT NULL,
	`window_started_at` timestamp(3) NOT NULL,
	`request_count` int NOT NULL DEFAULT 0,
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_developer_api_rate_limit_token_id_bucket_pk` PRIMARY KEY(`token_id`,`bucket`)
);
--> statement-breakpoint
ALTER TABLE `trip_developer_api_idempotency` ADD CONSTRAINT `developer_api_idempotency_token_fk` FOREIGN KEY (`token_id`) REFERENCES `trip_developer_api_token`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `trip_developer_api_rate_limit` ADD CONSTRAINT `developer_api_rate_limit_token_fk` FOREIGN KEY (`token_id`) REFERENCES `trip_developer_api_token`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `developer_api_idempotency_claimed_idx` ON `trip_developer_api_idempotency` (`claimed_at`);
--> statement-breakpoint
CREATE INDEX `developer_api_idempotency_completed_idx` ON `trip_developer_api_idempotency` (`completed_at`);
--> statement-breakpoint
CREATE INDEX `developer_api_rate_limit_window_idx` ON `trip_developer_api_rate_limit` (`window_started_at`);
--> statement-breakpoint
CREATE TABLE `trip_ai_dispatch` (
	`job_id` varchar(36) NOT NULL,
	`status` enum('queued','sending','sent','failed') NOT NULL DEFAULT 'queued',
	`attempts` int NOT NULL DEFAULT 0,
	`lease_id` varchar(36),
	`lease_expires_at` timestamp(3),
	`next_attempt_at` timestamp(3),
	`last_error` varchar(500),
	`last_attempt_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_ai_dispatch_job_id` PRIMARY KEY(`job_id`)
);
--> statement-breakpoint
ALTER TABLE `trip_ai_proposal` ADD `base_trip_revision` int;
--> statement-breakpoint
ALTER TABLE `trip_trip` ADD `revision` int DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `trip_ai_dispatch` ADD CONSTRAINT `trip_ai_dispatch_job_id_trip_ai_job_id_fk` FOREIGN KEY (`job_id`) REFERENCES `trip_ai_job`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `ai_dispatch_status_idx` ON `trip_ai_dispatch` (`status`,`next_attempt_at`);
