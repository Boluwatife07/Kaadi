// OWNER: SA
// Lead only. Section 7 — exact fixtures, fixed IDs. Idempotent: deletes and
// recreates every run. Run with `npx tsx prisma/seed.ts` (or `npm run seed`).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const db = new PrismaClient();

const PIN = "1234"; // seeded demo PIN for every worker — say so on stage

async function main() {
  // Children first, then parents — respects FK order, keeps this idempotent.
  await db.workHistoryEntry.deleteMany({});
  await db.guarantor.deleteMany({});
  await db.profileDraft.deleteMany({});
  await db.qrToken.deleteMany({});
  await db.employer.deleteMany({});
  await db.worker.deleteMany({});

  const pinHash = await bcrypt.hash(PIN, 10);

  // ---- w-amaka: happy path — published, voice intake, 2 confirmed
  // worker_declared entries, 1 guarantor, 1 active QrToken. ----
  await db.worker.create({
    data: {
      id: "w-amaka",
      displayName: "Amaka Nwosu",
      phone: "+2348031110001",
      pinHash,
      photoUrl: null,
      location: "Lekki, Lagos",
      languagesSpoken: "English,Yoruba",
      rawIntakeText:
        "I'm Amaka, I've been a cook for two families in Lekki over the last four years, I also do light cleaning.",
      intakeMode: "voice",
      structuredSkills: "Cooking,Cleaning,Meal planning",
      structuredSummary:
        "Experienced cook with four years across two Lekki households, also handles light cleaning.",
      workflowStatus: "published",
      guarantors: {
        create: {
          name: "Pastor Emeka Obi",
          phone: "+2348021110099",
          relationship: "Church elder",
        },
      },
      qrTokens: {
        create: { token: nanoid(21), active: true },
      },
    },
  });

  const eMusa = await db.employer.create({
    data: { id: "e-musa", displayName: "Musa Ibrahim", phone: "+2348051110002" },
  });

  await db.workHistoryEntry.create({
    data: {
      workerId: "w-amaka",
      employerName: "The Okafor Family",
      employerPhone: "+2348011110003",
      role: "Cook",
      startDate: new Date("2021-03-01"),
      endDate: new Date("2023-06-01"),
      isOngoing: false,
      source: "worker_declared",
      confirmationStatus: "confirmed",
    },
  });

  await db.workHistoryEntry.create({
    data: {
      workerId: "w-amaka",
      employerId: eMusa.id,
      employerName: eMusa.displayName,
      employerPhone: eMusa.phone,
      role: "Cook",
      startDate: new Date("2023-07-01"),
      endDate: null,
      isOngoing: true,
      source: "employer_added",
      confirmationStatus: "confirmed",
    },
  });

  // ---- w-tunde: needs_structuring, raw typed intake only, no draft yet —
  // demo generates this one live. ----
  await db.worker.create({
    data: {
      id: "w-tunde",
      displayName: "Tunde Bakare",
      phone: "+2348031110004",
      pinHash,
      location: "Surulere, Lagos",
      languagesSpoken: "English",
      rawIntakeText:
        "My name is Tunde, I have been a driver for 6 years. I drove for the Adeyemi family in Surulere from 2019 to 2022, then I drove for Mrs Balogun from 2022 until now. I also know basic car maintenance and I speak English and a little Hausa.",
      intakeMode: "text",
      workflowStatus: "needs_structuring",
    },
  });

  // ---- w-bisi: ProfileDraft with approvalStatus "draft", one field
  // already edited but not approved — demo opens straight into review. ----
  await db.worker.create({
    data: {
      id: "w-bisi",
      displayName: "Bisi Adeyemi",
      phone: "+2348031110005",
      pinHash,
      location: "Ikeja, Lagos",
      languagesSpoken: "English,Yoruba",
      rawIntakeText:
        "I am Bisi, I take care of children, I've been a nanny for one family in Ikeja since 2022, I'm good with toddlers and I can cook light meals too.",
      intakeMode: "text",
      workflowStatus: "review",
      profileDrafts: {
        create: {
          sourceText:
            "I am Bisi, I take care of children, I've been a nanny for one family in Ikeja since 2022, I'm good with toddlers and I can cook light meals too.",
          generatedName: "Bisi Adeyemi",
          generatedSkills: "Childcare,Toddler care,Light cooking",
          generatedLocation: "Ikeja, Lagos",
          generatedLanguages: "English,Yoruba",
          generatedHistory: JSON.stringify([
            {
              employerName: "The Adeyemi-Fashola Family",
              role: "Nanny",
              startDate: "2022-01-01",
              endDate: null,
              isOngoing: true,
              employerPhone: "+2348061110006",
            },
          ]),
          generatedGuarantor: null,
          missingInformation: JSON.stringify([
            "No guarantor mentioned — ask Bisi if she has one.",
          ]),
          fieldDecisions: JSON.stringify({ generatedSkills: "edited" }),
          approvalStatus: "draft",
          isFallback: false,
        },
      },
    },
  });

  // ---- w-chidinma: published, one pending employer_added entry (e-grace,
  // the integrity-critical edge case), one already-declined entry, 2
  // QrTokens (1 active, 1 deactivated — demonstrates the old link 410ing).
  // ----
  await db.worker.create({
    data: {
      id: "w-chidinma",
      displayName: "Chidinma Eze",
      phone: "+2348031110007",
      pinHash,
      location: "Yaba, Lagos",
      languagesSpoken: "English,Igbo",
      rawIntakeText:
        "I'm Chidinma, I've been cleaning homes and doing laundry for families around Yaba for about 5 years.",
      intakeMode: "voice",
      structuredSkills: "Cleaning,Laundry,Ironing",
      structuredSummary:
        "Five years of home cleaning and laundry work across Yaba households.",
      workflowStatus: "published",
      qrTokens: {
        create: [
          { token: nanoid(21), active: false, createdAt: new Date("2026-01-01") },
          { token: nanoid(21), active: true },
        ],
      },
    },
  });

  const eGrace = await db.employer.create({
    data: { id: "e-grace", displayName: "Grace Okonkwo", phone: "+2348071110008" },
  });

  await db.workHistoryEntry.create({
    data: {
      workerId: "w-chidinma",
      employerId: eGrace.id,
      employerName: eGrace.displayName,
      employerPhone: eGrace.phone,
      role: "Cleaner",
      startDate: new Date("2026-06-01"),
      endDate: null,
      isOngoing: true,
      source: "employer_added",
      confirmationStatus: "pending",
    },
  });

  await db.workHistoryEntry.create({
    data: {
      workerId: "w-chidinma",
      employerName: "A. Salako",
      employerPhone: "+2348081110009",
      role: "Cleaner",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-03-01"),
      isOngoing: false,
      source: "employer_added",
      confirmationStatus: "declined",
    },
  });

  console.log("Seed complete:");
  console.log(
    "  w-amaka (published, happy path) · w-tunde (needs_structuring) · w-bisi (mid-review draft)"
  );
  console.log(
    "  w-chidinma (published, 1 pending + 1 declined entry, 1 deactivated QR token)"
  );
  console.log(`  e-grace (pending against w-chidinma) · e-musa (confirmed on w-amaka)`);
  console.log(`  All seeded workers share PIN "${PIN}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
