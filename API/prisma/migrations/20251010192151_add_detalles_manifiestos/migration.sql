BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[manifiestoDetalles] (
    [id] INT NOT NULL IDENTITY(1,1),
    [DocNum] INT NOT NULL,
    [itemCode] NVARCHAR(1000) NOT NULL,
    [propiedad] NVARCHAR(1000) NOT NULL,
    [Descripcion] NVARCHAR(1000) NOT NULL,
    [Cantidad] INT NOT NULL,
    [PesoLb] FLOAT(53) NOT NULL,
    [FechaEntrega] DATETIME2 NOT NULL,
    [Ruta] NVARCHAR(1000) NOT NULL,
    [Medida] NVARCHAR(1000) NOT NULL,
    [PesoTotal] FLOAT(53) NOT NULL,
    [fechaCaducidad] DATETIME2,
    [pickingUserID] INT,
    [pickingUser] NVARCHAR(1000),
    [createAt] DATETIME2 NOT NULL CONSTRAINT [manifiestoDetalles_createAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2,
    CONSTRAINT [manifiestoDetalles_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [manifiestoDetalles_DocNum_idx] ON [dbo].[manifiestoDetalles]([DocNum]);

-- AddForeignKey
ALTER TABLE [dbo].[manifiestoDetalles] ADD CONSTRAINT [manifiestoDetalles_DocNum_fkey] FOREIGN KEY ([DocNum]) REFERENCES [dbo].[Manifiestos]([DocNum]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
