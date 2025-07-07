BEGIN TRY

BEGIN TRAN;

-- CreateIndex
CREATE NONCLUSTERED INDEX [Boleta_estado_idx] ON [dbo].[Boleta]([estado]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Boleta_fechaInicio_idx] ON [dbo].[Boleta]([fechaInicio]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Boleta_fechaFin_idx] ON [dbo].[Boleta]([fechaFin]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Boleta_placa_idx] ON [dbo].[Boleta]([placa]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Boleta_motorista_idx] ON [dbo].[Boleta]([motorista]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Boleta_empresa_idx] ON [dbo].[Boleta]([empresa]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
