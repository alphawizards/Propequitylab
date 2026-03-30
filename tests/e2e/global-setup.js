// @ts-check
/**
 * Playwright global setup — runs once before all tests.
 * Loads .env.playwright and initialises Clerk testing mode.
 */

require('dotenv').config({ path: '.env.playwright' });
const { clerkSetup } = require('@clerk/testing/playwright');

module.exports = async function globalSetup() {
  await clerkSetup();
};
