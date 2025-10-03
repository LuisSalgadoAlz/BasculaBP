BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[manifiestosLogs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [DocNum] INT NOT NULL,
    [Observacion] NVARCHAR(1000),
    [createAt] DATETIME2 NOT NULL CONSTRAINT [manifiestosLogs_createAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [manifiestosLogs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [manifiestosLogs_DocNum_idx] ON [dbo].[manifiestosLogs]([DocNum]);

-- AddForeignKey
ALTER TABLE [dbo].[manifiestosLogs] ADD CONSTRAINT [manifiestosLogs_DocNum_fkey] FOREIGN KEY ([DocNum]) REFERENCES [dbo].[Manifiestos]([DocNum]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
