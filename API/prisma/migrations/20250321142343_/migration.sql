/*
  Warnings:

  - You are about to drop the column `idProceso` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the `_BoletaToProcesos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PlacasToTransporte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Procesos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `idPlaca` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[_BoletaToProcesos] DROP CONSTRAINT [_BoletaToProcesos_A_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[_BoletaToProcesos] DROP CONSTRAINT [_BoletaToProcesos_B_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[_PlacasToTransporte] DROP CONSTRAINT [_PlacasToTransporte_A_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[_PlacasToTransporte] DROP CONSTRAINT [_PlacasToTransporte_B_fkey];

-- AlterTable
ALTER TABLE [dbo].[Boleta] DROP COLUMN [idProceso];
ALTER TABLE [dbo].[Boleta] ADD [idPlaca] INT NOT NULL;

-- DropTable
DROP TABLE [dbo].[_BoletaToProcesos];

-- DropTable
DROP TABLE [dbo].[_PlacasToTransporte];

-- DropTable
DROP TABLE [dbo].[Procesos];

-- CreateTable
CREATE TABLE [dbo].[TransportePlacasDetalles] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idPlaca] INT NOT NULL,
    [idTransporte] INT NOT NULL,
    CONSTRAINT [TransportePlacasDetalles_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idPlaca_fkey] FOREIGN KEY ([idPlaca]) REFERENCES [dbo].[Placas]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TransportePlacasDetalles] ADD CONSTRAINT [TransportePlacasDetalles_idPlaca_fkey] FOREIGN KEY ([idPlaca]) REFERENCES [dbo].[Placas]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
