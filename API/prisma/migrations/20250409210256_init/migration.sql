/*
  Warnings:

  - Added the required column `origen` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [transladoOrigen] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Boleta] ADD [destino] NVARCHAR(1000),
[idTransladoDestino] NVARCHAR(1000),
[idTransladoOrigen] INT,
[origen] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
