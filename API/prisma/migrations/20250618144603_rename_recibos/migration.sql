/*
  Warnings:

  - You are about to drop the column `recibo` on the `Tolva` table. All the data in the column will be lost.
  - Added the required column `tolvaDescarga` to the `Tolva` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Tolva] DROP COLUMN [recibo];
ALTER TABLE [dbo].[Tolva] ADD [tolvaDescarga] INT NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
