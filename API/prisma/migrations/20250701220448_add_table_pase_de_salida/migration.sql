BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[PasesDeSalida] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idBoleta] INT NOT NULL,
    [numPaseSalida] INT,
    [fechaSalida] DATETIME2,
    [observaciones] NVARCHAR(1000),
    CONSTRAINT [PasesDeSalida_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PasesDeSalida_idBoleta_key] UNIQUE NONCLUSTERED ([idBoleta])
);

-- AddForeignKey
ALTER TABLE [dbo].[PasesDeSalida] ADD CONSTRAINT [PasesDeSalida_idBoleta_fkey] FOREIGN KEY ([idBoleta]) REFERENCES [dbo].[Boleta]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
