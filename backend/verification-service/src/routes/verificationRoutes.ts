import { Router, Request, Response } from 'express';
import { verificationService } from '../services/verificationService';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'verification-service',
    workerId: verificationService.getWorkerId(),
    timestamp: new Date().toISOString()
  });
});

// Verify credential endpoint
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { credentialData } = req.body;

    // Validate request
    if (!credentialData || typeof credentialData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: credentialData is required and must be an object'
      });
    }

    // Verify credential
    const result = await verificationService.verifyCredential({ credentialData });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error verifying credential:', error);
    
    // Check if it's a connection error to issuance service
    if (error.message && error.message.includes('issuance service')) {
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable: Cannot connect to issuance service'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error while verifying credential'
    });
  }
});

// Get worker info
router.get('/worker', (req: Request, res: Response) => {
  res.json({
    workerId: verificationService.getWorkerId(),
    timestamp: new Date().toISOString()
  });
});

export default router;