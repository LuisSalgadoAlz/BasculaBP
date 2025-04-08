/*
  Warnings:

  - You are about to drop the column `Categoria` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `fechaDeEmision` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `idProveedores` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `idTipoDePeso` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the column `idTipoDeProducto` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the `Proveedores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TiposDePeso` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `idProducto` to the `Boleta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observaciones` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idProveedores_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idTipoDePeso_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idTipoDeProducto_fkey];

-- AlterTable
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [impreso] BIT NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [fechaFin] DATETIME2 NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [pesoFinal] FLOAT(53) NULL;
ALTER TABLE [dbo].[Boleta] DROP COLUMN [Categoria],
[fechaDeEmision],
[idProveedores],
[idTipoDePeso],
[idTipoDeProducto];
ALTER TABLE [dbo].[Boleta] ADD [desviacion] FLOAT(53),
[idProducto] INT NOT NULL,
[observaciones] VARCHAR(255) NOT NULL,
[pesoNeto] FLOAT(53);

-- DropTable
DROP TABLE [dbo].[Proveedores];

-- DropTable
DROP TABLE [dbo].[TiposDePeso];

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idProducto_fkey] FOREIGN KEY ([idProducto]) REFERENCES [dbo].[Producto]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
