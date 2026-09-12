CREATE TABLE `trip_ai_key` (
	`user_id` varchar(36) NOT NULL,
	`provider` enum('openai','anthropic','ollama') NOT NULL,
	`ciphertext` text NOT NULL,
	`iv` varchar(32) NOT NULL,
	`tag` varchar(32) NOT NULL,
	`hint` varchar(4) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_ai_key_user_id_provider_pk` PRIMARY KEY(`user_id`,`provider`),
	CONSTRAINT `trip_ai_key_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `ai_key_provider_idx` ON `trip_ai_key` (`provider`);
--> statement-breakpoint
CREATE TABLE `trip_ai_conversation` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`title` varchar(160),
	`provider` enum('openai','anthropic','ollama') NOT NULL,
	`model` varchar(160) NOT NULL,
	`reasoning_effort` enum('low','medium','high'),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_ai_conversation_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_ai_conversation_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `trip_ai_conversation_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `ai_conversation_user_id_idx` ON `trip_ai_conversation` (`user_id`);
--> statement-breakpoint
CREATE INDEX `ai_conversation_trip_id_idx` ON `trip_ai_conversation` (`trip_id`);
--> statement-breakpoint
CREATE TABLE `trip_ai_message` (
	`id` varchar(36) NOT NULL,
	`conversation_id` varchar(36) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`provider` enum('openai','anthropic','ollama'),
	`model` varchar(160),
	`input_tokens` int,
	`output_tokens` int,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_ai_message_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_ai_message_conversation_id_trip_ai_conversation_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `trip_ai_conversation`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `ai_message_conversation_id_idx` ON `trip_ai_message` (`conversation_id`);
--> statement-breakpoint
ALTER TABLE `trip_ai_message` ADD `job_id` varchar(36);
--> statement-breakpoint
ALTER TABLE `trip_ai_message` ADD CONSTRAINT `ai_message_job_idx` UNIQUE(`job_id`);
--> statement-breakpoint
CREATE TABLE `trip_ai_job` (
	`id` varchar(36) NOT NULL,
	`conversation_id` varchar(36) NOT NULL,
	`user_message_id` varchar(36) NOT NULL,
	`kind` enum('question','proposal') NOT NULL,
	`status` enum('queued','running','done','failed') NOT NULL DEFAULT 'queued',
	`attempts` int NOT NULL DEFAULT 0,
	`error` varchar(500),
	`proposal` json,
	`lease_id` varchar(36),
	`lease_expires_at` timestamp(3),
	`completed_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_ai_job_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_ai_job_conversation_id_trip_ai_conversation_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `trip_ai_conversation`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `trip_ai_job_user_message_id_trip_ai_message_id_fk` FOREIGN KEY (`user_message_id`) REFERENCES `trip_ai_message`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `ai_job_conversation_id_idx` ON `trip_ai_job` (`conversation_id`);
--> statement-breakpoint
CREATE INDEX `ai_job_status_idx` ON `trip_ai_job` (`status`);
--> statement-breakpoint
CREATE TABLE `trip_ai_usage` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`conversation_id` varchar(36),
	`job_id` varchar(36),
	`provider` enum('openai','anthropic','ollama') NOT NULL,
	`model` varchar(160) NOT NULL,
	`input_tokens` int NOT NULL DEFAULT 0,
	`output_tokens` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_ai_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_ai_usage_user_id_trip_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `trip_user`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `trip_ai_usage_conversation_id_trip_ai_conversation_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `trip_ai_conversation`(`id`) ON DELETE set null ON UPDATE no action,
	CONSTRAINT `trip_ai_usage_job_id_trip_ai_job_id_fk` FOREIGN KEY (`job_id`) REFERENCES `trip_ai_job`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `ai_usage_user_created_at_idx` ON `trip_ai_usage` (`user_id`,`created_at`);
--> statement-breakpoint
ALTER TABLE `trip_ai_usage` ADD CONSTRAINT `ai_usage_job_idx` UNIQUE(`job_id`);
--> statement-breakpoint
CREATE TABLE `trip_ai_proposal` (
	`id` varchar(36) NOT NULL,
	`job_id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`status` enum('pending','approved','applying','rejected','applied') NOT NULL DEFAULT 'pending',
	`changes` json NOT NULL,
	`base_trip_updated_at` timestamp(3),
	`lease_id` varchar(36),
	`lease_expires_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_ai_proposal_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_ai_proposal_job_id_trip_ai_job_id_fk` FOREIGN KEY (`job_id`) REFERENCES `trip_ai_job`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `trip_ai_proposal_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `ai_proposal_job_idx` UNIQUE(`job_id`)
);
--> statement-breakpoint
CREATE INDEX `ai_proposal_trip_id_idx` ON `trip_ai_proposal` (`trip_id`);
