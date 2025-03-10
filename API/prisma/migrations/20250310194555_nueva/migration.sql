/*
  Warnings:

  - A unique constraint covering the columns `[usuarios]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuarios` to the `Usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "usuarios" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_usuarios_key" ON "Usuarios"("usuarios");
