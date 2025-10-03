BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Manifiestos] DROP CONSTRAINT [Manifiestos_estadoPicking_df];
ALTER TABLE [dbo].[Manifiestos] ADD CONSTRAINT [Manifiestos_estadoPicking_df] DEFAULT 'AGN' FOR [estadoPicking];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
