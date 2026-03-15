import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function test() {
    const user = await prisma.employee.findFirst({
        where: { email: "admin@timey.com" }
    });

    if (!user) {
        console.log("User not found");
        return;
    }

    console.log("User found:", user.email);
    console.log("Stored hash:", user.password);

    const isMatch = await bcrypt.compare("password123", user.password);
    console.log("Password match:", isMatch);
}

test()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
