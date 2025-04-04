-- CreateTable
CREATE TABLE `outfit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `event` VARCHAR(50) NOT NULL,
    `photo` VARCHAR(191) NOT NULL,
    `include` BOOLEAN NOT NULL DEFAULT false,
    `percentage` INTEGER NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `outfit` ADD CONSTRAINT `outfit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
