/*
  Warnings:

  - Added the required column `factura` to the `Facturas` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Facturas] ADD [factura] INT NOT NULL;

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
