CREATE TABLE `trip_schedule_kind` (
	`id` varchar(36) NOT NULL,
	`trip_id` varchar(36) NOT NULL,
	`key` varchar(40) NOT NULL,
	`label` varchar(40) NOT NULL,
	`legend_label` varchar(80) NOT NULL,
	`color_token` enum('muted','success','warning','destructive','chart-1','chart-2','chart-3','chart-4','chart-5') NOT NULL DEFAULT 'muted',
	`buffer_label` varchar(80),
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `trip_schedule_kind_id` PRIMARY KEY(`id`),
	CONSTRAINT `schedule_kind_trip_key_idx` UNIQUE(`trip_id`,`key`)
);
--> statement-breakpoint
ALTER TABLE `trip_schedule_kind` ADD CONSTRAINT `trip_schedule_kind_trip_id_trip_trip_id_fk` FOREIGN KEY (`trip_id`) REFERENCES `trip_trip`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `schedule_kind_trip_id_idx` ON `trip_schedule_kind` (`trip_id`);--> statement-breakpoint
ALTER TABLE `trip_schedule_item` ADD `kind_id` varchar(36);--> statement-breakpoint
INSERT INTO `trip_schedule_kind` (`id`, `trip_id`, `key`, `label`, `legend_label`, `color_token`, `buffer_label`, `sort_order`) SELECT UUID(), t.`id`, 'planned', '계획', '계획 일정', 'muted', '마지막 10분 여유', 0 FROM `trip_trip` t;--> statement-breakpoint
INSERT INTO `trip_schedule_kind` (`id`, `trip_id`, `key`, `label`, `legend_label`, `color_token`, `buffer_label`, `sort_order`) SELECT UUID(), t.`id`, 'confirmed', '확정 시각', '항공편·공식 셔틀', 'success', '전후 여유 10분', 1 FROM `trip_trip` t;--> statement-breakpoint
INSERT INTO `trip_schedule_kind` (`id`, `trip_id`, `key`, `label`, `legend_label`, `color_token`, `buffer_label`, `sort_order`) SELECT UUID(), t.`id`, 'target', '예매 목표', '예매 목표·미확정', 'warning', '마지막 10분 여유', 2 FROM `trip_trip` t;--> statement-breakpoint
UPDATE `trip_schedule_item` i JOIN `trip_day` d ON d.`id` = i.`day_id` JOIN `trip_schedule_kind` k ON k.`trip_id` = d.`trip_id` AND k.`key` = i.`kind` SET i.`kind_id` = k.`id`;--> statement-breakpoint
ALTER TABLE `trip_schedule_item` MODIFY `kind_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `trip_schedule_item` ADD CONSTRAINT `trip_schedule_item_kind_id_trip_schedule_kind_id_fk` FOREIGN KEY (`kind_id`) REFERENCES `trip_schedule_kind`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `schedule_item_kind_id_idx` ON `trip_schedule_item` (`kind_id`);--> statement-breakpoint
ALTER TABLE `trip_schedule_item` DROP COLUMN `kind`;
