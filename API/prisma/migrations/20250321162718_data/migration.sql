/*
  Warnings:

  - Added the required column `tipo` to the `Vehiculo` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Vehiculo] ADD [marca] NVARCHAR(1000),
[modelo] NVARCHAR(1000),
[pesoMaximo] FLOAT(53),
[tipo] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
