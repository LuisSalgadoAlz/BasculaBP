/*
  Warnings:

  - You are about to drop the `Destino` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Origen` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idDestino_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idOrigen_fkey];

-- AlterTable
ALTER TABLE [dbo].[Direcciones] ADD [descripcion] NVARCHAR(1000);

-- DropTable
DROP TABLE [dbo].[Destino];

-- DropTable
DROP TABLE [dbo].[Origen];

-- CreateTable
CREATE TABLE [dbo].[Logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [usuario] NVARCHAR(1000) NOT NULL,
    [tabla] NVARCHAR(1000) NOT NULL,
    [Evento] NVARCHAR(1000) NOT NULL,
    [Fecha] DATETIME2 NOT NULL,
    [Ip] NVARCHAR(1000),
    [navegador] NVARCHAR(1000),
    [Clave] INT,
    CONSTRAINT [Logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
