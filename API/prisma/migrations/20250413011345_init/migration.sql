BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Boleta] DROP CONSTRAINT [Boleta_idSocio_fkey];

-- AlterTable
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [idPlaca] INT NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [idEmpresa] INT NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [idSocio] INT NULL;
ALTER TABLE [dbo].[Boleta] ALTER COLUMN [idMotorista] INT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idSocio_fkey] FOREIGN KEY ([idSocio]) REFERENCES [dbo].[Socios]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
