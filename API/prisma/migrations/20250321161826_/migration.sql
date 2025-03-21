/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Clientes` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[Clientes] ADD CONSTRAINT [Clientes_nombre_key] UNIQUE NONCLUSTERED ([nombre]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
