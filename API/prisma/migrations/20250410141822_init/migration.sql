BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Boleta] (
    [id] INT NOT NULL IDENTITY(1,1),
    [boletaType] INT NOT NULL,
    [idPlaca] INT NOT NULL,
    [placa] NVARCHAR(1000) NOT NULL,
    [idEmpresa] INT NOT NULL,
    [empresa] NVARCHAR(1000) NOT NULL,
    [idSocio] INT NOT NULL,
    [socio] NVARCHAR(1000) NOT NULL,
    [idProducto] INT NOT NULL,
    [producto] NVARCHAR(1000) NOT NULL,
    [proceso] INT NOT NULL,
    [idOrigen] INT,
    [origen] NVARCHAR(1000) NOT NULL,
    [idDestino] INT,
    [destino] NVARCHAR(1000),
    [idTransladoOrigen] INT,
    [transladoOrigen] NVARCHAR(1000),
    [idTransladoDestino] NVARCHAR(1000),
    [transladoDestino] INT,
    [idMovimiento] INT NOT NULL,
    [movimiento] NVARCHAR(1000),
    [manifiesto] INT,
    [estado] NVARCHAR(1000) NOT NULL,
    [impreso] BIT,
    [idUsuario] INT NOT NULL,
    [usuario] NVARCHAR(1000) NOT NULL,
    [idMotorista] INT NOT NULL,
    [motorista] NVARCHAR(1000) NOT NULL,
    [ordenDeCompra] INT,
    [pesoTeorico] FLOAT(53),
    [pesoNeto] FLOAT(53),
    [desviacion] FLOAT(53),
    [observaciones] VARCHAR(255) NOT NULL,
    [pesoInicial] FLOAT(53) NOT NULL,
    [pesoFinal] FLOAT(53),
    [fechaInicio] DATETIME2 NOT NULL,
    [fechaFin] DATETIME2,
    CONSTRAINT [Boleta_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Direcciones] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [tipo] INT NOT NULL,
    [idCliente] INT NOT NULL,
    [descripcion] NVARCHAR(1000),
    [estado] BIT NOT NULL,
    CONSTRAINT [Direcciones_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Empresa] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [telefono] NVARCHAR(1000),
    [descripcion] NVARCHAR(1000),
    [estado] BIT NOT NULL,
    [idSocios] INT NOT NULL,
    CONSTRAINT [Empresa_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [usuario] NVARCHAR(1000) NOT NULL,
    [tabla] NVARCHAR(1000),
    [Evento] NVARCHAR(1000) NOT NULL,
    [Fecha] DATETIME2 NOT NULL,
    [Ip] NVARCHAR(1000),
    [navegador] NVARCHAR(1000),
    [Clave] INT,
    CONSTRAINT [Logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Motoristas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [telefono] NVARCHAR(1000),
    [correo] NVARCHAR(1000),
    [estado] BIT NOT NULL,
    [idEmpresa] INT NOT NULL,
    CONSTRAINT [Motoristas_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Motoristas_correo_key] UNIQUE NONCLUSTERED ([correo])
);

-- CreateTable
CREATE TABLE [dbo].[Movimientos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [tipo] INT NOT NULL,
    CONSTRAINT [Movimientos_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Producto] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(1000) NOT NULL,
    [nombre] NVARCHAR(1000) NOT NULL,
    [estado] BIT NOT NULL,
    CONSTRAINT [Producto_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Socios] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [tipo] INT NOT NULL,
    [telefono] NVARCHAR(1000),
    [correo] NVARCHAR(1000),
    [estado] BIT NOT NULL,
    CONSTRAINT [Socios_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Socios_correo_key] UNIQUE NONCLUSTERED ([correo])
);

-- CreateTable
CREATE TABLE [dbo].[Translado] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [tipo] INT NOT NULL,
    [estado] BIT NOT NULL,
    CONSTRAINT [Translado_pkey] PRIMARY KEY CLUSTERED ([id])
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

-- CreateTable
CREATE TABLE [dbo].[Vehiculo] (
    [id] INT NOT NULL IDENTITY(1,1),
    [placa] NVARCHAR(1000) NOT NULL,
    [modelo] NVARCHAR(1000),
    [marca] NVARCHAR(1000),
    [tipo] NVARCHAR(1000) NOT NULL,
    [pesoMaximo] FLOAT(53),
    [estado] BIT NOT NULL,
    [idEmpresa] INT NOT NULL,
    CONSTRAINT [Vehiculo_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idPlaca_fkey] FOREIGN KEY ([idPlaca]) REFERENCES [dbo].[Vehiculo]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idUsuario_fkey] FOREIGN KEY ([idUsuario]) REFERENCES [dbo].[Usuarios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idEmpresa_fkey] FOREIGN KEY ([idEmpresa]) REFERENCES [dbo].[Empresa]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idSocio_fkey] FOREIGN KEY ([idSocio]) REFERENCES [dbo].[Socios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idProducto_fkey] FOREIGN KEY ([idProducto]) REFERENCES [dbo].[Producto]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idMotorista_fkey] FOREIGN KEY ([idMotorista]) REFERENCES [dbo].[Motoristas]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Boleta] ADD CONSTRAINT [Boleta_idMovimiento_fkey] FOREIGN KEY ([idMovimiento]) REFERENCES [dbo].[Movimientos]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Direcciones] ADD CONSTRAINT [Direcciones_idCliente_fkey] FOREIGN KEY ([idCliente]) REFERENCES [dbo].[Socios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Empresa] ADD CONSTRAINT [Empresa_idSocios_fkey] FOREIGN KEY ([idSocios]) REFERENCES [dbo].[Socios]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Motoristas] ADD CONSTRAINT [Motoristas_idEmpresa_fkey] FOREIGN KEY ([idEmpresa]) REFERENCES [dbo].[Empresa]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Vehiculo] ADD CONSTRAINT [Vehiculo_idEmpresa_fkey] FOREIGN KEY ([idEmpresa]) REFERENCES [dbo].[Empresa]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
