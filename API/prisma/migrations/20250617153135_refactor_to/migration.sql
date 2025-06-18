/*
  Warnings:

  - You are about to drop the column `fechaTolva` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `silo2` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `silo3` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `siloID` on the `Boleta` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_siloID_fkey];

-- AlterTable
ALTER TABLE [dbo].[Boleta] DROP COLUMN [fechaTolva],
[silo2],
[silo3],
[siloID];

-- CreateTable
CREATE TABLE [dbo].[Tolva] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idBoleta] INT NOT NULL,
    [fechaEntrada] DATETIME2 NOT NULL,
    [fechaSalida] DATETIME2,
    [idUsuarioTolva] INT NOT NULL,
    [usuarioTolva] NVARCHAR(1000) NOT NULL,
    [recibo] INT NOT NULL,
    [siloPrincipal] INT NOT NULL,
    [siloSecundario] INT,
    [SiloTerciario] INT,
    CONSTRAINT [Tolva_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Tolva_idBoleta_key] UNIQUE NONCLUSTERED ([idBoleta])
);

-- AddForeignKey
ALTER TABLE [dbo].[Tolva] ADD CONSTRAINT [Tolva_siloPrincipal_fkey] FOREIGN KEY ([siloPrincipal]) REFERENCES [dbo].[Silos]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Tolva] ADD CONSTRAINT [Tolva_siloSecundario_fkey] FOREIGN KEY ([siloSecundario]) REFERENCES [dbo].[Silos]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Tolva] ADD CONSTRAINT [Tolva_SiloTerciario_fkey] FOREIGN KEY ([SiloTerciario]) REFERENCES [dbo].[Silos]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Tolva] ADD CONSTRAINT [Tolva_idBoleta_fkey] FOREIGN KEY ([idBoleta]) REFERENCES [dbo].[Boleta]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
