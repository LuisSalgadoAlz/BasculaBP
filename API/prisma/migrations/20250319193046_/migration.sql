/*
  Warnings:

  - You are about to drop the column `idTipoDeProcesos` on the `Procesos` table. All the data in the column will be lost.
  - Added the required column `nombre` to the `Procesos` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idProceso_fkey];

-- AlterTable
ALTER TABLE [dbo].[Procesos] DROP COLUMN [idTipoDeProcesos];
ALTER TABLE [dbo].[Procesos] ADD [nombre] NVARCHAR(1000) NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[_BoletaToProcesos] (
    [A] NVARCHAR(1000) NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_BoletaToProcesos_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_BoletaToProcesos_B_index] ON [dbo].[_BoletaToProcesos]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[_BoletaToProcesos] ADD CONSTRAINT [_BoletaToProcesos_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Boleta]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_BoletaToProcesos] ADD CONSTRAINT [_BoletaToProcesos_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[Procesos]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
