BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idMovimiento_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idProducto_fkey];

-- AlterTable
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [boletaType] INT NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [idProducto] INT NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [producto] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [proceso] INT NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [idMovimiento] INT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idProducto_fkey] FOREIGN KEY ([idProducto]) REFERENCES [dbo].[Producto]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idMovimiento_fkey] FOREIGN KEY ([idMovimiento]) REFERENCES [dbo].[Movimientos]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
