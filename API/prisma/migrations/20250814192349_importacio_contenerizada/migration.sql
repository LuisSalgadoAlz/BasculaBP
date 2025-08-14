BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[impContenerizada] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idBoleta] INT NOT NULL,
    [contenedor] NVARCHAR(1000) NOT NULL,
    [sacosTeoricos] INT NOT NULL,
    [marchamoDeOrigen] NVARCHAR(1000) NOT NULL,
    [encargadoDeBodegaID] INT,
    [encargadoDeNombre] NVARCHAR(1000),
    [sacosCargados] INT,
    CONSTRAINT [impContenerizada_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [impContenerizada_idBoleta_key] UNIQUE NONCLUSTERED ([idBoleta])
);

-- CreateTable
CREATE TABLE [dbo].[encargadosDeBodega] (
    [id] INT NOT NULL IDENTITY(1,1),
    [Nombre] NVARCHAR(1000) NOT NULL,
    [BodegaEncargado] INT NOT NULL,
    CONSTRAINT [encargadosDeBodega_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[impContenerizada] ADD CONSTRAINT [impContenerizada_idBoleta_fkey] FOREIGN KEY ([idBoleta]) REFERENCES [dbo].[Boleta]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[impContenerizada] ADD CONSTRAINT [impContenerizada_encargadoDeBodegaID_fkey] FOREIGN KEY ([encargadoDeBodegaID]) REFERENCES [dbo].[encargadosDeBodega]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[encargadosDeBodega] ADD CONSTRAINT [encargadosDeBodega_BodegaEncargado_fkey] FOREIGN KEY ([BodegaEncargado]) REFERENCES [dbo].[Translado]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
