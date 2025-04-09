/*
  Warnings:

  - You are about to drop the column `idCliente` on the `Boleta` table. All the data in the column will be lost.
  - Added the required column `idSocio` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idCliente_fkey];

-- AlterTable
ALTER TABLE [dbo].[Boleta] DROP COLUMN [idCliente];
ALTER TABLE [dbo].[Boleta] ADD [idSocio] INT NOT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idSocio_fkey] FOREIGN KEY ([idSocio]) REFERENCES [dbo].[Socios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
