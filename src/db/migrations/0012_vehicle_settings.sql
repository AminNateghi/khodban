ALTER TABLE `vehicles` ADD `distance_unit` text DEFAULT 'faKm';--> statement-breakpoint
ALTER TABLE `vehicles` ADD `fuel_unit` text DEFAULT 'faLiters';--> statement-breakpoint
ALTER TABLE `vehicles` ADD `currency_symbol` text DEFAULT 'faToman';--> statement-breakpoint
UPDATE `vehicles`
SET
  `distance_unit` = 'faKm',
  `fuel_unit` = 'faLiters',
  `currency_symbol` = 'faToman';

ALTER TABLE `profile` DROP COLUMN `distance_unit`;--> statement-breakpoint
ALTER TABLE `profile` DROP COLUMN `fuel_unit`;--> statement-breakpoint
ALTER TABLE `profile` DROP COLUMN `currency_symbol`;
