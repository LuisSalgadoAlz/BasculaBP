/*
  Warnings:

  - You are about to drop the `Clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehiculoXmotorista` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehiculoXtransporte` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `idSocios` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idEmpresa` to the `Motoristas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idEmpresa` to the `Vehiculo` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idCliente_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idEmpresa_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idMotorista_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idPlaca_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Direcciones] DROP CONSTRAINT [Direcciones_idCliente_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[VehiculoXmotorista] DROP CONSTRAINT [VehiculoXmotorista_idMotorista_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[VehiculoXmotorista] DROP CONSTRAINT [VehiculoXmotorista_idVehiculo_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[VehiculoXtransporte] DROP CONSTRAINT [VehiculoXtransporte_idEmpresa_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[VehiculoXtransporte] DROP CONSTRAINT [VehiculoXtransporte_idVehiculo_fkey];

-- AlterTable
ALTER TABLE [dbo].[Empresa] ADD [idSocios] INT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Motoristas] ADD [idEmpresa] INT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Vehiculo] ADD [idEmpresa] INT NOT NULL;

-- DropTable
DROP TABLE [dbo].[Clientes];

-- DropTable
DROP TABLE [dbo].[VehiculoXmotorista];

-- DropTable
DROP TABLE [dbo].[VehiculoXtransporte];

-- CreateTable
CREATE TABLE [dbo].[Socios] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [tipo] INT NOT NULL,
    [direccion] NVARCHAR(1000),
    [telefono] NVARCHAR(1000),
    [correo] NVARCHAR(1000),
    CONSTRAINT [Socios_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Socios_correo_key] UNIQUE NONCLUSTERED ([correo])
);

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idPlaca_fkey] FOREIGN KEY ([idPlaca]) REFERENCES [dbo].[Vehiculo]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idEmpresa_fkey] FOREIGN KEY ([idEmpresa]) REFERENCES [dbo].[Empresa]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idCliente_fkey] FOREIGN KEY ([idCliente]) REFERENCES [dbo].[Socios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idMotorista_fkey] FOREIGN KEY ([idMotorista]) REFERENCES [dbo].[Motoristas]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Direcciones] ADD CONSTRAINT [Direcciones_idCliente_fkey] FOREIGN KEY ([idCliente]) REFERENCES [dbo].[Socios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Empresa] ADD CONSTRAINT [Empresa_idSocios_fkey] FOREIGN KEY ([idSocios]) REFERENCES [dbo].[Socios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Motoristas] ADD CONSTRAINT [Motoristas_idEmpresa_fkey] FOREIGN KEY ([idEmpresa]) REFERENCES [dbo].[Empresa]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Vehiculo] ADD CONSTRAINT [Vehiculo_idEmpresa_fkey] FOREIGN KEY ([idEmpresa]) REFERENCES [dbo].[Empresa]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
