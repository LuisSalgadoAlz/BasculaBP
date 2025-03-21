BEGIN TRY

BEGIN TRAN;

-- AddForeignKey
ALTER TABLE [dbo].[TransportePlacasDetalles] ADD CONSTRAINT [TransportePlacasDetalles_idTransporte_fkey] FOREIGN KEY ([idTransporte]) REFERENCES [dbo].[Transporte]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
