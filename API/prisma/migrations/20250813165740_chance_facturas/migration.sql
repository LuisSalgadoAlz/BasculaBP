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
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Facturas'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Facturas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [codigoProveedor] NVARCHAR(1000) NOT NULL,
    [Proveedor] NVARCHAR(1000) NOT NULL,
    [Cantidad] FLOAT(53) NOT NULL,
    [Proceso] INT NOT NULL,
    [idSocio] INT NOT NULL,
    [socio] NVARCHAR(1000) NOT NULL,
    [createdByUserID] INT NOT NULL,
    [createdByUserName] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Facturas_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Facturas_pkey] PRIMARY KEY CLUSTERED ([id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_Facturas] ON;
IF EXISTS(SELECT * FROM [dbo].[Facturas])
    EXEC('INSERT INTO [dbo].[_prisma_new_Facturas] ([Cantidad],[Proceso],[Proveedor],[codigoProveedor],[createdAt],[createdByUserID],[createdByUserName],[id],[idSocio],[socio]) SELECT [Cantidad],[Proceso],[Proveedor],[codigoProveedor],[createdAt],[createdByUserID],[createdByUserName],[id],[idSocio],[socio] FROM [dbo].[Facturas] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Facturas] OFF;
DROP TABLE [dbo].[Facturas];
EXEC SP_RENAME N'dbo._prisma_new_Facturas', N'Facturas';
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
