-- CreateTable
CREATE TABLE "Boleta" (
    "id" TEXT NOT NULL,
    "Categoria" TEXT NOT NULL,
    "idProceso" INTEGER NOT NULL,
    "idTransporte" INTEGER NOT NULL,
    "idTipoDePeso" INTEGER NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "idTipoDeProducto" INTEGER NOT NULL,
    "idProveedores" INTEGER NOT NULL,
    "idOrigen" INTEGER NOT NULL,
    "idDestino" INTEGER NOT NULL,
    "manifiesto" INTEGER,
    "pesoTeorico" DOUBLE PRECISION,
    "estado" TEXT NOT NULL,
    "impreso" BOOLEAN NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaDeEmision" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boleta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "correo" TEXT,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Origen" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Origen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destino" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Destino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procesos" (
    "id" SERIAL NOT NULL,
    "idTipoDeProcesos" INTEGER NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,

    CONSTRAINT "Proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TiposDePeso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "TiposDePeso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transporte" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "usuarios" TEXT NOT NULL,
    "email" TEXT,
    "tipo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_correo_key" ON "Clientes"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_usuarios_key" ON "Usuarios"("usuarios");

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idProceso_fkey" FOREIGN KEY ("idProceso") REFERENCES "Procesos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idTransporte_fkey" FOREIGN KEY ("idTransporte") REFERENCES "Transporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idTipoDePeso_fkey" FOREIGN KEY ("idTipoDePeso") REFERENCES "TiposDePeso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idTipoDeProducto_fkey" FOREIGN KEY ("idTipoDeProducto") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idProveedores_fkey" FOREIGN KEY ("idProveedores") REFERENCES "Proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idOrigen_fkey" FOREIGN KEY ("idOrigen") REFERENCES "Origen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idDestino_fkey" FOREIGN KEY ("idDestino") REFERENCES "Destino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
