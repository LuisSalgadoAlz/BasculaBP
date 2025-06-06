BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Config] (
    [id] INT NOT NULL IDENTITY(1,1),
    [clave] NVARCHAR(1000) NOT NULL,
    [valor] FLOAT(53) NOT NULL,
    [descripcion] NVARCHAR(1000),
    CONSTRAINT [Config_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
