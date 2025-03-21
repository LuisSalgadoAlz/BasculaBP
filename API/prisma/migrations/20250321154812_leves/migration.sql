/*
  Warnings:

  - A unique constraint covering the columns `[idPlaca,idTransporte]` on the table `TransportePlacasDetalles` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[TransportePlacasDetalles] ADD CONSTRAINT [TransportePlacasDetalles_idPlaca_idTransporte_key] UNIQUE NONCLUSTERED ([idPlaca], [idTransporte]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
