/*
  Warnings:

  - You are about to drop the column `fechaFin` on the `Procesos` table. All the data in the column will be lost.
  - You are about to drop the column `fechaInicio` on the `Procesos` table. All the data in the column will be lost.
  - You are about to drop the column `peso` on the `Procesos` table. All the data in the column will be lost.
  - Added the required column `fechaFin` to the `Boleta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaInicio` to the `Boleta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `peso` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] ADD [fechaFin] DATETIME2 NOT NULL,
[fechaInicio] DATETIME2 NOT NULL,
[peso] FLOAT(53) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Procesos] DROP COLUMN [fechaFin],
[fechaInicio],
[peso];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
