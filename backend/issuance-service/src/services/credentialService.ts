import { db, Credential } from '../database/db';
import * as crypto from 'crypto';
import * as os from 'os';

export interface IssuanceRequest {
  credentialData: Record<string, any>;
}

export interface IssuanceResponse {
  success: boolean;
  message: string;
  credential?: Credential;
  alreadyIssued?: boolean;
}

export class CredentialService {
  private workerId: string;

  constructor() {
    // Generate worker ID based on hostname (pod name in Kubernetes)
    this.workerId = this.generateWorkerId();
  }

  private generateWorkerId(): string {
    const hostname = os.hostname();
    // In Kubernetes, hostname will be the pod name
    return hostname;
  }

  public getWorkerId(): string {
    return this.workerId;
  }

  private generateCredentialId(data: Record<string, any>): string {
    // Generate deterministic ID based on credential data
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  public issueCredential(request: IssuanceRequest): IssuanceResponse {
    try {
      const credentialId = this.generateCredentialId(request.credentialData);

      // Check if credential already exists
      const existingCredential = db.findCredential(credentialId);
      
      if (existingCredential) {
        return {
          success: true,
          message: `Credential already issued by ${existingCredential.issuedBy}`,
          credential: existingCredential,
          alreadyIssued: true
        };
      }

      // Create new credential
      const credential: Credential = {
        id: credentialId,
        data: request.credentialData,
        issuedBy: this.workerId,
        issuedAt: new Date().toISOString()
      };

      // Save to database
      db.saveCredential(credential);

      return {
        success: true,
        message: `Credential issued by ${this.workerId}`,
        credential,
        alreadyIssued: false
      };
    } catch (error) {
      throw new Error(`Failed to issue credential: ${error}`);
    }
  }
}

export const credentialService = new CredentialService();