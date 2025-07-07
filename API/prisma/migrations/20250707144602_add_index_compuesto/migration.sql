BEGIN TRY

BEGIN TRAN;

-- CreateIndex
CREATE NONCLUSTERED INDEX [Boleta_empresa_fechaInicio_idx] ON [dbo].[Boleta]([empresa], [fechaInicio]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Boleta_estado_fechaInicio_idx] ON [dbo].[Boleta]([estado], [fechaInicio]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Boleta_placa_fechaInicio_idx] ON [dbo].[Boleta]([placa], [fechaInicio]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
