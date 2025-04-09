/*
  Warnings:

  - Added the required column `cliente` to the `Boleta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresa` to the `Boleta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motorista` to the `Boleta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movimiento` to the `Boleta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placa` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] ADD [cliente] NVARCHAR(1000) NOT NULL,
[empresa] NVARCHAR(1000) NOT NULL,
[motorista] NVARCHAR(1000) NOT NULL,
[movimiento] NVARCHAR(1000) NOT NULL,
[placa] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
