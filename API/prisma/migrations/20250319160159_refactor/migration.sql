/*
  Warnings:

  - Added the required column `idPlaca` to the `Transporte` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Transporte] ADD [idPlaca] INT NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[Placas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Placas_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Transporte] ADD CONSTRAINT [Transporte_idPlaca_fkey] FOREIGN KEY ([idPlaca]) REFERENCES [dbo].[Placas]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
