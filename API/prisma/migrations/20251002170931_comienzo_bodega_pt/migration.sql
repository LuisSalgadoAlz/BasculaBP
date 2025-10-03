BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[UsuariosBPT] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idUsuario] INT,
    [canal] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UsuariosBPT_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UsuariosBPT_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UsuariosBPT_idUsuario_key] UNIQUE NONCLUSTERED ([idUsuario])
);

-- CreateTable
CREATE TABLE [dbo].[Manifiestos] (
    [DocNum] INT NOT NULL,
    [U_Status] NVARCHAR(1000) NOT NULL,
    [Tipo] NVARCHAR(1000) NOT NULL,
    [U_IDRuta] NVARCHAR(1000) NOT NULL,
    [U_FechaEntrega] DATETIME2 NOT NULL,
    [U_PesoTotal] FLOAT(53) NOT NULL,
    [U_Tipo] NVARCHAR(1000) NOT NULL,
    [U_CamionPlaca] NVARCHAR(1000) NOT NULL,
    [U_IDChofer] NVARCHAR(1000) NOT NULL,
    [U_Chofer] NVARCHAR(1000) NOT NULL,
    [Bodega] NVARCHAR(1000) NOT NULL,
    [usuarioBPTId] INT,
    [userAsignadoId] INT,
    [estadoPicking] NVARCHAR(1000) NOT NULL CONSTRAINT [Manifiestos_estadoPicking_df] DEFAULT 'PND',
    [pickingActualId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Manifiestos_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Manifiestos_pkey] PRIMARY KEY CLUSTERED ([DocNum]),
    CONSTRAINT [Manifiestos_pickingActualId_key] UNIQUE NONCLUSTERED ([pickingActualId])
);

-- CreateTable
CREATE TABLE [dbo].[Picking] (
    [id] INT NOT NULL IDENTITY(1,1),
    [manifiestosDocNum] INT NOT NULL,
    [usuarioBPTPickingId] INT NOT NULL,
    [asignadoPorBPTId] INT NOT NULL,
    [fechaInicioPicking] DATETIME2,
    [fechaFinPicking] DATETIME2,
    [estado] NVARCHAR(1000) NOT NULL CONSTRAINT [Picking_estado_df] DEFAULT 'PND',
    [motivoDevolucion] TEXT,
    [numeroIntentos] INT NOT NULL CONSTRAINT [Picking_numeroIntentos_df] DEFAULT 1,
    [esReasignacion] BIT NOT NULL CONSTRAINT [Picking_esReasignacion_df] DEFAULT 0,
    [pickingOriginalId] INT,
    [revisadoPorBPTId] INT,
    [fechaRevision] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Picking_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Picking_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [UsuariosBPT_idUsuario_idx] ON [dbo].[UsuariosBPT]([idUsuario]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [UsuariosBPT_canal_idx] ON [dbo].[UsuariosBPT]([canal]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Manifiestos_usuarioBPTId_idx] ON [dbo].[Manifiestos]([usuarioBPTId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Manifiestos_userAsignadoId_idx] ON [dbo].[Manifiestos]([userAsignadoId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Manifiestos_estadoPicking_idx] ON [dbo].[Manifiestos]([estadoPicking]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Manifiestos_U_FechaEntrega_idx] ON [dbo].[Manifiestos]([U_FechaEntrega]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Manifiestos_Bodega_idx] ON [dbo].[Manifiestos]([Bodega]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Picking_manifiestosDocNum_idx] ON [dbo].[Picking]([manifiestosDocNum]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Picking_usuarioBPTPickingId_idx] ON [dbo].[Picking]([usuarioBPTPickingId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Picking_asignadoPorBPTId_idx] ON [dbo].[Picking]([asignadoPorBPTId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Picking_revisadoPorBPTId_idx] ON [dbo].[Picking]([revisadoPorBPTId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Picking_pickingOriginalId_idx] ON [dbo].[Picking]([pickingOriginalId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Picking_estado_idx] ON [dbo].[Picking]([estado]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Picking_esReasignacion_idx] ON [dbo].[Picking]([esReasignacion]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Picking_fechaInicioPicking_idx] ON [dbo].[Picking]([fechaInicioPicking]);

-- AddForeignKey
ALTER TABLE [dbo].[UsuariosBPT] ADD CONSTRAINT [UsuariosBPT_idUsuario_fkey] FOREIGN KEY ([idUsuario]) REFERENCES [dbo].[Usuarios]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Manifiestos] ADD CONSTRAINT [Manifiestos_usuarioBPTId_fkey] FOREIGN KEY ([usuarioBPTId]) REFERENCES [dbo].[UsuariosBPT]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Manifiestos] ADD CONSTRAINT [Manifiestos_userAsignadoId_fkey] FOREIGN KEY ([userAsignadoId]) REFERENCES [dbo].[UsuariosBPT]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Manifiestos] ADD CONSTRAINT [Manifiestos_pickingActualId_fkey] FOREIGN KEY ([pickingActualId]) REFERENCES [dbo].[Picking]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Picking] ADD CONSTRAINT [Picking_manifiestosDocNum_fkey] FOREIGN KEY ([manifiestosDocNum]) REFERENCES [dbo].[Manifiestos]([DocNum]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Picking] ADD CONSTRAINT [Picking_usuarioBPTPickingId_fkey] FOREIGN KEY ([usuarioBPTPickingId]) REFERENCES [dbo].[UsuariosBPT]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Picking] ADD CONSTRAINT [Picking_asignadoPorBPTId_fkey] FOREIGN KEY ([asignadoPorBPTId]) REFERENCES [dbo].[UsuariosBPT]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Picking] ADD CONSTRAINT [Picking_revisadoPorBPTId_fkey] FOREIGN KEY ([revisadoPorBPTId]) REFERENCES [dbo].[UsuariosBPT]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Picking] ADD CONSTRAINT [Picking_pickingOriginalId_fkey] FOREIGN KEY ([pickingOriginalId]) REFERENCES [dbo].[Picking]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
