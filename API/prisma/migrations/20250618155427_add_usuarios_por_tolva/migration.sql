BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Tolva] ADD [estado] INT;

-- CreateTable
CREATE TABLE [dbo].[UsuariosPorTolva] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idUsuario] INT,
    [tolva] INT NOT NULL,
    CONSTRAINT [UsuariosPorTolva_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UsuariosPorTolva_idUsuario_key] UNIQUE NONCLUSTERED ([idUsuario])
);

-- AddForeignKey
ALTER TABLE [dbo].[UsuariosPorTolva] ADD CONSTRAINT [UsuariosPorTolva_idUsuario_fkey] FOREIGN KEY ([idUsuario]) REFERENCES [dbo].[Usuarios]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
