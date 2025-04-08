/*
  Warnings:

  - The primary key for the `Boleta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Boleta` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
BEGIN TRY

BEGIN TRAN;

-- RedefineTables
BEGIN TRANSACTION;
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Boleta'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Boleta] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idPlaca] INT NOT NULL,
    [idEmpresa] INT NOT NULL,
    [idCliente] INT NOT NULL,
    [idProducto] INT NOT NULL,
    [idOrigen] INT NOT NULL,
    [idDestino] INT NOT NULL,
    [idMovimiento] INT NOT NULL,
    [manifiesto] INT,
    [estado] NVARCHAR(1000) NOT NULL,
    [impreso] BIT,
    [idUsuario] INT NOT NULL,
    [idMotorista] INT NOT NULL,
    [ordenDeCompra] INT,
    [pesoTeorico] FLOAT(53),
    [pesoNeto] FLOAT(53),
    [desviacion] FLOAT(53),
    [observaciones] VARCHAR(255) NOT NULL,
    [pesoInicial] FLOAT(53) NOT NULL,
    [pesoFinal] FLOAT(53),
    [fechaInicio] DATETIME2 NOT NULL,
    [fechaFin] DATETIME2,
    CONSTRAINT [Boleta_pkey] PRIMARY KEY CLUSTERED ([id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_Boleta] ON;
IF EXISTS(SELECT * FROM [dbo].[Boleta])
    EXEC('INSERT INTO [dbo].[_prisma_new_Boleta] ([desviacion],[estado],[fechaFin],[fechaInicio],[id],[idCliente],[idDestino],[idEmpresa],[idMotorista],[idMovimiento],[idOrigen],[idPlaca],[idProducto],[idUsuario],[impreso],[manifiesto],[observaciones],[ordenDeCompra],[pesoFinal],[pesoInicial],[pesoNeto],[pesoTeorico]) SELECT [desviacion],[estado],[fechaFin],[fechaInicio],[id],[idCliente],[idDestino],[idEmpresa],[idMotorista],[idMovimiento],[idOrigen],[idPlaca],[idProducto],[idUsuario],[impreso],[manifiesto],[observaciones],[ordenDeCompra],[pesoFinal],[pesoInicial],[pesoNeto],[pesoTeorico] FROM [dbo].[Boleta] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Boleta] OFF;
DROP TABLE [dbo].[Boleta];
EXEC SP_RENAME N'dbo._prisma_new_Boleta', N'Boleta';
COMMIT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
