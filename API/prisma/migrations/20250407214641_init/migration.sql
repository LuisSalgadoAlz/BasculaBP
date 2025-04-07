/*
  Warnings:

  - Added the required column `idMovimiento` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] ADD [idMovimiento] INT NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[Movimientos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [tipo] INT NOT NULL,
    CONSTRAINT [Movimientos_pkey] PRIMARY KEY CLUSTERED ([id])
);

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
