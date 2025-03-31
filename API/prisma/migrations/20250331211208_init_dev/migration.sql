/*
  Warnings:

  - Added the required column `estado` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Made the column `nombre` on table `Producto` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Producto] ALTER COLUMN [nombre] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[Producto] ADD [estado] BIT NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
