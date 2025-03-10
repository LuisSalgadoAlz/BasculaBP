-- CreateTable
CREATE TABLE "Boleta" (
    "id" TEXT NOT NULL,
    "Categoria" TEXT NOT NULL,
    "idProceso" INTEGER NOT NULL,
    "idTransporte" INTEGER NOT NULL,
    "idTipoDePeso" INTEGER NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "idTipoDePrdocuto" INTEGER NOT NULL,
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
CREATE TABLE "Procesos" (
    "id" SERIAL NOT NULL,
    "idTipoDeProcesos" INTEGER NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procesos_pkey" PRIMARY KEY ("id")
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
    "email" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idProceso_fkey" FOREIGN KEY ("idProceso") REFERENCES "Procesos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idTransporte_fkey" FOREIGN KEY ("idTransporte") REFERENCES "Transporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleta" ADD CONSTRAINT "Boleta_idTipoDePeso_fkey" FOREIGN KEY ("idTipoDePeso") REFERENCES "TiposDePeso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
