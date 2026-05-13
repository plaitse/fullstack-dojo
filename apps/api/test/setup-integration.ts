import { execSync } from 'child_process';

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://dojo:dojo@localhost:5433/fullstack_dojo_test';

export default async function () {
  process.env.DATABASE_URL = TEST_DATABASE_URL;

  execSync('npx prisma db push --force-reset --config ./prisma/prisma.config.ts', {
    cwd: __dirname + '/..',
    env: {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'Yes, proceed',
    },
    stdio: 'pipe',
  });
}
