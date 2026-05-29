/* eslint-disable no-console */
/**
 * One-shot script to generate VAPID keys for Web Push.
 * Run with: npx tsx scripts/generate-vapid-keys.ts
 *
 * Copy the printed keys into your `.env` file:
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_EMAIL=mailto:you@example.com
 *
 * Re-running the script generates a fresh keypair — once you ship to
 * production keep these stable, otherwise existing subscriptions break.
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("\n=== JayField VAPID Keys ===\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_EMAIL=mailto:hello@jayfield.com`);
console.log(
  "\nPaste these into .env and restart the dev server.\n" +
    "Keep VAPID_PRIVATE_KEY secret — never commit it.\n"
);
