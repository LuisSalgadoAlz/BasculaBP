/*
  Warnings:

  - You are about to drop the column `descripcion` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `code` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Producto] ALTER COLUMN [nombre] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Producto] DROP COLUMN [descripcion];
ALTER TABLE [dbo].[Producto] ADD [code] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
