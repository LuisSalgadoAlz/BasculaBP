BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Boleta] (
    [id] NVARCHAR(1000) NOT NULL,
    [Categoria] NVARCHAR(1000) NOT NULL,
    [idProceso] INT NOT NULL,
    [idTransporte] INT NOT NULL,
    [idTipoDePeso] INT NOT NULL,
    [idCliente] INT NOT NULL,
    [idTipoDeProducto] INT NOT NULL,
    [idProveedores] INT NOT NULL,
    [idOrigen] INT NOT NULL,
    [idDestino] INT NOT NULL,
    [manifiesto] INT,
    [pesoTeorico] FLOAT(53),
    [estado] NVARCHAR(1000) NOT NULL,
    [impreso] BIT NOT NULL,
    [idUsuario] INT NOT NULL,
    [fechaDeEmision] DATETIME2 NOT NULL,
    CONSTRAINT [Boleta_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Clientes] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [direccion] NVARCHAR(1000),
    [telefono] NVARCHAR(1000),
    [correo] NVARCHAR(1000),
    CONSTRAINT [Clientes_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Clientes_correo_key] UNIQUE NONCLUSTERED ([correo])
);

-- CreateTable
CREATE TABLE [dbo].[Origen] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    CONSTRAINT [Origen_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Destino] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    CONSTRAINT [Destino_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Procesos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idTipoDeProcesos] INT NOT NULL,
    [peso] FLOAT(53) NOT NULL,
    [fechaInicio] DATETIME2 NOT NULL,
    [fechaFin] DATETIME2 NOT NULL,
    CONSTRAINT [Procesos_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Producto] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    CONSTRAINT [Producto_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Proveedores] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [telefono] NVARCHAR(1000),
    [correo] NVARCHAR(1000),
    CONSTRAINT [Proveedores_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TiposDePeso] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [estado] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [TiposDePeso_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Transporte] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [placa] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    [estado] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Transporte_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Usuarios] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [usuarios] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [tipo] NVARCHAR(1000) NOT NULL,
    [contrasena] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Usuarios_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Usuarios_usuarios_key] UNIQUE NONCLUSTERED ([usuarios])
);

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idUsuario_fkey] FOREIGN KEY ([idUsuario]) REFERENCES [dbo].[Usuarios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idProceso_fkey] FOREIGN KEY ([idProceso]) REFERENCES [dbo].[Procesos]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idTransporte_fkey] FOREIGN KEY ([idTransporte]) REFERENCES [dbo].[Transporte]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idTipoDePeso_fkey] FOREIGN KEY ([idTipoDePeso]) REFERENCES [dbo].[TiposDePeso]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idCliente_fkey] FOREIGN KEY ([idCliente]) REFERENCES [dbo].[Clientes]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idTipoDeProducto_fkey] FOREIGN KEY ([idTipoDeProducto]) REFERENCES [dbo].[Producto]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idProveedores_fkey] FOREIGN KEY ([idProveedores]) REFERENCES [dbo].[Proveedores]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idOrigen_fkey] FOREIGN KEY ([idOrigen]) REFERENCES [dbo].[Origen]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idDestino_fkey] FOREIGN KEY ([idDestino]) REFERENCES [dbo].[Destino]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
