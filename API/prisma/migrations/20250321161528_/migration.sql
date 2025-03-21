/*
  Warnings:

  - You are about to drop the column `idTransporte` on the `Boleta` table. All the data in the column will be lost.
  - You are about to drop the `Placas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transporte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransportePlacasDetalles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `idEmpresa` to the `Boleta` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idPlaca_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idTransporte_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[TransportePlacasDetalles] DROP CONSTRAINT [TransportePlacasDetalles_idPlaca_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[TransportePlacasDetalles] DROP CONSTRAINT [TransportePlacasDetalles_idTransporte_fkey];

-- AlterTable
ALTER TABLE [dbo].[Boleta] DROP COLUMN [idTransporte];
ALTER TABLE [dbo].[Boleta] ADD [idEmpresa] INT NOT NULL;

-- DropTable
DROP TABLE [dbo].[Placas];

-- DropTable
DROP TABLE [dbo].[Transporte];

-- DropTable
DROP TABLE [dbo].[TransportePlacasDetalles];

-- CreateTable
CREATE TABLE [dbo].[Empresa] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [telefono] NVARCHAR(1000),
    [descripcion] NVARCHAR(1000),
    [estado] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Empresa_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Vehiculo] (
    [id] INT NOT NULL IDENTITY(1,1),
    [placa] NVARCHAR(1000) NOT NULL,
    [estado] BIT NOT NULL,
    CONSTRAINT [Vehiculo_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[VehiculoXtransporte] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idVehiculo] INT NOT NULL,
    [idEmpresa] INT NOT NULL,
    CONSTRAINT [VehiculoXtransporte_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [VehiculoXtransporte_idVehiculo_idEmpresa_key] UNIQUE NONCLUSTERED ([idVehiculo],[idEmpresa])
);

-- CreateTable
CREATE TABLE [dbo].[VehiculoXmotorista] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idVehiculo] INT NOT NULL,
    [idMotorista] INT NOT NULL,
    CONSTRAINT [VehiculoXmotorista_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [VehiculoXmotorista_idVehiculo_idMotorista_key] UNIQUE NONCLUSTERED ([idVehiculo],[idMotorista])
);

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idPlaca_fkey] FOREIGN KEY ([idPlaca]) REFERENCES [dbo].[Vehiculo]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idEmpresa_fkey] FOREIGN KEY ([idEmpresa]) REFERENCES [dbo].[Empresa]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[VehiculoXtransporte] ADD CONSTRAINT [VehiculoXtransporte_idVehiculo_fkey] FOREIGN KEY ([idVehiculo]) REFERENCES [dbo].[Vehiculo]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[VehiculoXtransporte] ADD CONSTRAINT [VehiculoXtransporte_idEmpresa_fkey] FOREIGN KEY ([idEmpresa]) REFERENCES [dbo].[Empresa]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[VehiculoXmotorista] ADD CONSTRAINT [VehiculoXmotorista_idVehiculo_fkey] FOREIGN KEY ([idVehiculo]) REFERENCES [dbo].[Vehiculo]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[VehiculoXmotorista] ADD CONSTRAINT [VehiculoXmotorista_idMotorista_fkey] FOREIGN KEY ([idMotorista]) REFERENCES [dbo].[Motoristas]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
