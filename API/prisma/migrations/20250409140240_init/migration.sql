/*
  Warnings:

  - Added the required column `proceso` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] ADD [proceso] INT NOT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idPlaca_fkey] FOREIGN KEY ([idPlaca]) REFERENCES [dbo].[Vehiculo]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idUsuario_fkey] FOREIGN KEY ([idUsuario]) REFERENCES [dbo].[Usuarios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idEmpresa_fkey] FOREIGN KEY ([idEmpresa]) REFERENCES [dbo].[Empresa]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idCliente_fkey] FOREIGN KEY ([idCliente]) REFERENCES [dbo].[Socios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idProducto_fkey] FOREIGN KEY ([idProducto]) REFERENCES [dbo].[Producto]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idMotorista_fkey] FOREIGN KEY ([idMotorista]) REFERENCES [dbo].[Motoristas]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idMovimiento_fkey] FOREIGN KEY ([idMovimiento]) REFERENCES [dbo].[Movimientos]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
