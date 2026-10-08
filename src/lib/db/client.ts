/**
 * Career Quest — Database Client & Environment Safety Guard
 * Source: BACKEND_ARCHITECTURE_SPECIFICATION §7, TESTING_AND_QUALITY_STRATEGY §3
 */

export interface DbConfig {
  databaseUrl?: string;
  testDatabaseUrl?: string;
  isProduction: boolean;
  isTest: boolean;
}

/**
 * Returns current database runtime configuration.
 */
export function getDbConfig(): DbConfig {
  const isProduction = process.env.NODE_ENV === "production";
  const isTest = process.env.NODE_ENV === "test";

  return {
    databaseUrl: process.env.DATABASE_URL,
    testDatabaseUrl: process.env.TEST_DATABASE_URL,
    isProduction,
    isTest,
  };
}

/**
 * Production Guard (TESTING_AND_QUALITY_STRATEGY §3):
 * Any destructive test/reset/seed operation MUST fail closed when environment is production.
 * "Ambiguous environment = fail closed."
 */
export function assertSafeEnvironmentForDestructiveOp(operationName: string): void {
  const config = getDbConfig();

  if (config.isProduction) {
    throw new Error(
      `[CRITICAL_SAFETY_VIOLATION] Refusing to execute destructive database operation '${operationName}' in PRODUCTION environment.`
    );
  }

  // If in test mode, require TEST_DATABASE_URL to be distinct or test environment explicitly asserted
  if (config.isTest && !config.testDatabaseUrl && !process.env.ALLOW_LOCAL_TEST_DB) {
    throw new Error(
      `[TEST_SAFETY_GUARD] Cannot run destructive test operation '${operationName}' without TEST_DATABASE_URL or ALLOW_LOCAL_TEST_DB set.`
    );
  }
}
