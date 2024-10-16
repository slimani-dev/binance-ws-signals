-- CreateTable
CREATE TABLE `Coin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME NULL,

    UNIQUE INDEX `Coin_symbol_key`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Signal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coinId` INTEGER NOT NULL,
    `status` VARCHAR(191) NULL,
    `reachedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Target` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `signalId` INTEGER NOT NULL,
    `type` ENUM('TARGET', 'STOP_LOSS') NOT NULL,
    `value` DOUBLE NOT NULL,
    `reachedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Signal` ADD CONSTRAINT `Signal_coinId_fkey` FOREIGN KEY (`coinId`) REFERENCES `Coin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Target` ADD CONSTRAINT `Target_signalId_fkey` FOREIGN KEY (`signalId`) REFERENCES `Signal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
