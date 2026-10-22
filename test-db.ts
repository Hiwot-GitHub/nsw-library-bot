import { db } from "./lib/prisma";

async function main() {
  console.log("Testing database connection...");

  // 1. Create a test member
  const newMember = await db.orm.public.Member.create({
      cardNumber: "TEST-7772",
      email: "demo@example.com",
      fullName: "Demo Member",

  });

  console.log("Successfully created member:", newMember);

  // 2. Fetch all members from the database
  const allMembers = await db.orm.public.Member.all();
  console.log("All members in database:", allMembers);
}

main()
  .catch((e) => {
    console.error("Error during database test:", e);
    process.exit(1);
  });