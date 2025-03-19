/*
  Warnings:

  - You are about to drop the column `peso` on the `Boleta` table. All the data in the column will be lost.
  - Added the required column `pesoFinal` to the `Boleta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pesoInicial` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] DROP COLUMN [peso];
ALTER TABLE [dbo].[Boleta] ADD [pesoFinal] FLOAT(53) NOT NULL,
[pesoInicial] FLOAT(53) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
