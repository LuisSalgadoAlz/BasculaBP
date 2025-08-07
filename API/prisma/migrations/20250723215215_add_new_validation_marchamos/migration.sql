/*
  Warnings:

  - You are about to drop the column `observacionMarchamos` on the `Tolva` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Tolva] ALTER COLUMN [Sello1] INT NULL;
ALTER TABLE [dbo].[Tolva] ALTER COLUMN [Sello2] INT NULL;
ALTER TABLE [dbo].[Tolva] ALTER COLUMN [Sello3] INT NULL;
ALTER TABLE [dbo].[Tolva] ALTER COLUMN [Sello4] INT NULL;
ALTER TABLE [dbo].[Tolva] ALTER COLUMN [Sello5] INT NULL;
ALTER TABLE [dbo].[Tolva] ALTER COLUMN [Sello6] INT NULL;
ALTER TABLE [dbo].[Tolva] DROP COLUMN [observacionMarchamos];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
