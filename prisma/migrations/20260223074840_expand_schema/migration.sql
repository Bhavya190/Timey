-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'employee', 'teamLead');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('day', 'evening', 'night');

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'employee',
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "shift" "Shift" NOT NULL DEFAULT 'day',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateRegion" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "hireDate" TEXT NOT NULL,
    "terminationDate" TEXT,
    "workType" TEXT NOT NULL,
    "billingType" TEXT NOT NULL,
    "employeeRate" TEXT NOT NULL,
    "employeeCurrency" TEXT NOT NULL,
    "billingRateType" TEXT NOT NULL,
    "billingCurrency" TEXT NOT NULL,
    "billingStart" TEXT NOT NULL,
    "billingEnd" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "clientName" TEXT NOT NULL,
    "teamLeadId" INTEGER,
    "managerId" INTEGER,
    "defaultBillingRate" TEXT,
    "billingType" TEXT,
    "fixedCost" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "invoiceFileName" TEXT,
    "description" TEXT,
    "duration" TEXT,
    "estimatedCost" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "projectName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workedHours" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "description" TEXT,
    "billingType" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssigneeTasks" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TeamMembers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_code_key" ON "Employee"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_AssigneeTasks_AB_unique" ON "_AssigneeTasks"("A", "B");

-- CreateIndex
CREATE INDEX "_AssigneeTasks_B_index" ON "_AssigneeTasks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TeamMembers_AB_unique" ON "_TeamMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_TeamMembers_B_index" ON "_TeamMembers"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_teamLeadId_fkey" FOREIGN KEY ("teamLeadId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssigneeTasks" ADD CONSTRAINT "_AssigneeTasks_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssigneeTasks" ADD CONSTRAINT "_AssigneeTasks_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamMembers" ADD CONSTRAINT "_TeamMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamMembers" ADD CONSTRAINT "_TeamMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
