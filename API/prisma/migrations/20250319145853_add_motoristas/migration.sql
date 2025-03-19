/*
  Warnings:

  - Added the required column `idMotorista` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] ADD [idMotorista] INT NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[Motoristas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [direccion] NVARCHAR(1000),
    [telefono] NVARCHAR(1000),
    [correo] NVARCHAR(1000),
    CONSTRAINT [Motoristas_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Motoristas_correo_key] UNIQUE NONCLUSTERED ([correo])
);

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idMotorista_fkey] FOREIGN KEY ([idMotorista]) REFERENCES [dbo].[Motoristas]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
