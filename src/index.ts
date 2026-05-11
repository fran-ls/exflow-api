import 'dotenv/config';
import app from './config/app';
import { db } from './database/prisma';
import { envs } from './config/envs';

const PORT = envs.PORT || 3000;

async function bootstrap(): Promise<void> {
  try {
    await db.connect();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📖 Environment: ${envs.NODE_ENV || 'development'}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await db.disconnect();
        console.log('👋 Server closed');
        process.exit(0);
      });
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();