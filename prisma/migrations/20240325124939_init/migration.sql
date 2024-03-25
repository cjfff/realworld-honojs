/*
  Warnings:

  - You are about to drop the column `favorited` on the `ArticleFavorite` table. All the data in the column will be lost.
  - Added the required column `favorite` to the `ArticleFavorite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ArticleFavorite` DROP COLUMN `favorited`,
    ADD COLUMN `favorite` INTEGER NOT NULL;
