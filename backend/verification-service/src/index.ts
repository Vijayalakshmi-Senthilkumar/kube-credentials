import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 Verification Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/verification/health`);
});