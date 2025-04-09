/*
  Warnings:

  - You are about to drop the column `cliente` on the `Boleta` table. All the data in the column will be lost.
  - Added the required column `socio` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] DROP COLUMN [cliente];
ALTER TABLE [dbo].[Boleta] ADD [socio] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
