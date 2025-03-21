BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Direcciones] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [tipo] INT NOT NULL,
    [idCliente] INT NOT NULL,
    CONSTRAINT [Direcciones_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Direcciones] ADD CONSTRAINT [Direcciones_idCliente_fkey] FOREIGN KEY ([idCliente]) REFERENCES [dbo].[Clientes]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
