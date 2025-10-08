import * as fs from 'fs';
import * as path from 'path';

export interface VerificationRecord {
  credentialId: string;
  verifiedBy: string;
  verifiedAt: string;
  status: 'valid' | 'invalid';
  issuedBy?: string;
  issuedAt?: string;
}

export interface Database {
  verifications: VerificationRecord[];
}

class DatabaseService {
  private dbPath: string;
  private db: Database;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'verifications.json');
    this.ensureDataDirectory();
    this.db = this.loadDatabase();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadDatabase(): Database {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading database:', error);
    }
    return { verifications: [] };
  }

  private saveDatabase(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database:', error);
      throw new Error('Failed to save verification record');
    }
  }

  public saveVerification(record: VerificationRecord): void {
    this.db.verifications.push(record);
    this.saveDatabase();
  }

  public getAllVerifications(): VerificationRecord[] {
    return this.db.verifications;
  }

  // For testing purposes
  public clearDatabase(): void {
    this.db = { verifications: [] };
    this.saveDatabase();
  }
}

export const db = new DatabaseService();