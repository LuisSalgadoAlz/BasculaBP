/*
  Warnings:

  - You are about to drop the column `idTransladoDestino` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `idTransladoOrigen` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `transladoDestino` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `transladoOrigen` on the `Boleta` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] DROP COLUMN [idTransladoDestino],
[idTransladoOrigen],
[transladoDestino],
[transladoOrigen];
ALTER TABLE [dbo].[Boleta] ADD [idTrasladoDestino] NVARCHAR(1000),
[idTrasladoOrigen] INT,
[trasladoDestino] INT,
[trasladoOrigen] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
