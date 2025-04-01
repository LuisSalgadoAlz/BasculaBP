BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Vehiculo] DROP CONSTRAINT [Vehiculo_placa_key];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
