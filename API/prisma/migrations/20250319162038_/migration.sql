BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Transporte] DROP CONSTRAINT [Transporte_idPlaca_fkey];

-- CreateTable
CREATE TABLE [dbo].[_PlacasToTransporte] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_PlacasToTransporte_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_PlacasToTransporte_B_index] ON [dbo].[_PlacasToTransporte]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[_PlacasToTransporte] ADD CONSTRAINT [_PlacasToTransporte_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Placas]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_PlacasToTransporte] ADD CONSTRAINT [_PlacasToTransporte_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[Transporte]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
