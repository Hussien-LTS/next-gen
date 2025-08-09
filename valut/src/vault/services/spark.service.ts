 // src/spark/spark.service.ts
import { Injectable } from '@nestjs/common';

export class SparkService {
  // Load your Vault's public key
  private readonly publicKey: string;

  constructor() {
    // Adjust the path to your actual public key file
    // this.publicKey = fs.readFileSync(path.resolve(__dirname, 'vault_public_key.pem'), 'utf8');
  }

}
