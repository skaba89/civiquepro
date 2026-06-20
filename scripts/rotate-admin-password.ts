/**
 * Rotate admin password.
 *
 * Usage:
 *   npx tsx scripts/rotate-admin-password.ts <new-password>
 *
 * Or interactive (will prompt):
 *   npx tsx scripts/rotate-admin-password.ts
 *
 * The script:
 *   1. Hashes the new password with bcrypt (cost 12)
 *   2. Updates the admin@civiquepro.fr user in the DB
 *   3. Verifies the new password works
 *   4. Prints the admin email + confirmation
 */
/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "readline";

const db = new PrismaClient();

async function ask(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const argPassword = process.argv[2];

  let newPassword = argPassword;
  if (!newPassword) {
    console.log("Rotation du mot de passe admin CiviquePro");
    console.log("Politique: 8-128 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractere special.");
    newPassword = await ask("Nouveau mot de passe: ");
  }

  if (!newPassword) {
    console.error("Erreur: mot de passe vide.");
    process.exit(1);
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    console.error("Erreur: le mot de passe doit contenir entre 8 et 128 caracteres.");
    process.exit(1);
  }
  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
    console.error("Erreur: le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractere special.");
    process.exit(1);
  }

  console.log("\nHachage du mot de passe (bcrypt cost 12)...");
  const hashed = await bcrypt.hash(newPassword, 12);

  console.log("Mise a jour de l'utilisateur admin@civiquepro.fr...");
  const updated = await db.user.updateMany({
    where: { email: "admin@civiquepro.fr" },
    data: { password: hashed },
  });

  if (updated.count === 0) {
    console.error("Erreur: utilisateur admin@civiquepro.fr introuvable. Executer d'abord `npx tsx prisma/seed.ts`.");
    process.exit(1);
  }

  // Verify
  const admin = await db.user.findUnique({ where: { email: "admin@civiquepro.fr" } });
  if (!admin || !(await bcrypt.compare(newPassword, admin.password!))) {
    console.error("Erreur: verification du mot de passe echouee.");
    process.exit(1);
  }

  console.log("\n Mot de passe admin rotate avec succes.");
  console.log(`   Email: admin@civiquepro.fr`);
  console.log(`   Date: ${new Date().toISOString()}`);
  console.log(`   Hash (12 rounds) stocke en base.`);

  await db.$disconnect();
}

main().catch((err) => {
  console.error("Erreur:", err);
  process.exit(1);
});
