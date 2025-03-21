/*
  Warnings:

  - You are about to alter the column `estado` on the `Empresa` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Bit`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Empresa] ALTER COLUMN [estado] BIT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Logs] ALTER COLUMN [tabla] NVARCHAR(1000) NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
