BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Tolva] ADD [idUsuarioDeCierre] INT,
[observacionDeCancelacion] NVARCHAR(1000),
[observacionTiempo] NVARCHAR(1000),
[usuarioDeCierre] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
