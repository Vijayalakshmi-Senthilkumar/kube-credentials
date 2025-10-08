import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Issuance Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/credentials/health`);
});