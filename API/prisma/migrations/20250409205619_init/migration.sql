BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [idOrigen] INT NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [idDestino] INT NULL;
ALTER TABLE [dbo].[Boleta] ADD [transladoDestino] INT,
[transladoOrigen] INT;

-- CreateTable
CREATE TABLE [dbo].[Translado] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [tipo] INT NOT NULL,
    [estado] BIT NOT NULL,
    CONSTRAINT [Translado_pkey] PRIMARY KEY CLUSTERED ([id])
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
