/*
  Warnings:

  - The `impreso` column on the `Boleta` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] DROP COLUMN [impreso];
ALTER TABLE [dbo].[Boleta] ADD [impreso] DATETIME2;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
