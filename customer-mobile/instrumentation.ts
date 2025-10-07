export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (!process.env.REDIS_URL) {
      console.warn('⚠️  REDIS_URL not configured. Background jobs disabled.');
      console.warn('   Add REDIS_URL secret to enable automatic ride request cleanup.');
      return;
    }

    try {
      const { initializeBackgroundJobs } = await import('./server/services/startup');
      const rideCleanupWorker = await import('./server/services/rideCleanupWorker');
      
      await initializeBackgroundJobs();
      
      console.log('✅ Instrumentation registered - Background workers active');
    } catch (error) {
      console.error('❌ Failed to initialize background workers:', error);
    }
  }
}
