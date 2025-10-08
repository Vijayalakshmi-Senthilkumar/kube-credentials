import * as fs from 'fs';
import * as path from 'path';

export interface Credential {
  id: string;
  data: Record<string, any>;
  issuedBy: string;
  issuedAt: string;
}

export interface Database {
  credentials: Credential[];
}

class DatabaseService {
  private dbPath: string;
  private db: Database;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'credentials.json');
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
    return { credentials: [] };
  }

  private saveDatabase(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database:', error);
      throw new Error('Failed to save credential');
    }
  }

  public findCredential(credentialId: string): Credential | undefined {
    return this.db.credentials.find(cred => cred.id === credentialId);
  }

  public saveCredential(credential: Credential): void {
    this.db.credentials.push(credential);
    this.saveDatabase();
  }

  public getAllCredentials(): Credential[] {
    return this.db.credentials;
  }

  // For testing purposes
  public clearDatabase(): void {
    this.db = { credentials: [] };
    this.saveDatabase();
  }
}

export const db = new DatabaseService();