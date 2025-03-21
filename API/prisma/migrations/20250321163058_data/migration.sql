/*
  Warnings:

  - A unique constraint covering the columns `[placa]` on the table `Vehiculo` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[Vehiculo] ADD CONSTRAINT [Vehiculo_placa_key] UNIQUE NONCLUSTERED ([placa]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
