BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Facturas] (
    [id] INT NOT NULL,
    [codigoProveedor] NVARCHAR(1000) NOT NULL,
    [Proveedor] NVARCHAR(1000) NOT NULL,
    [Cantidad] FLOAT(53) NOT NULL,
    [Proceso] INT NOT NULL,
    [idSocio] INT NOT NULL,
    [createdByUserID] INT NOT NULL,
    [createdByUserName] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Facturas_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Facturas_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Facturas] ADD CONSTRAINT [Facturas_idSocio_fkey] FOREIGN KEY ([idSocio]) REFERENCES [dbo].[Socios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
