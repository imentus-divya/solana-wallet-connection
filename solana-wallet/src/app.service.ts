import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv'

dotenv.config()

import {
  clusterApiUrl,
  Connection,
  PublicKey,LAMPORTS_PER_SOL,SystemProgram,Transaction,sendAndConfirmTransaction,Keypair,
} from "@solana/web3.js";
 
@Injectable()


export class AppService 
{
  private connection:Connection;

  constructor()
  {
    const customRpcUrl=process.env.RPC_URL;
    this.connection =  new Connection(customRpcUrl, "confirmed")    
  }

   async checkBalance(req): Promise<object> {
    try {
      const { pubKey } = req;
      // check existence of public key
      if (!pubKey) {
        throw new Error("Public key is missing from the request.");
      }
      
      let wallet: PublicKey;
      // validate public key
      try {
        wallet = new PublicKey(pubKey);
        console.log("👛 wallet:", wallet);
      } catch (error) {
        console.error("Error creating PublicKey from pubKey:", error);
        throw new Error("Invalid public key format.");
      }

      // get balance func
      let balance: number;
      try {
        balance = await this.connection.getBalance(wallet);
        console.log("🚀 ~ balance:", balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        throw new Error("Failed to fetch wallet balance.");
      }
  
      const output = balance / LAMPORTS_PER_SOL;     
      return {
        lamports: balance,
        sol: output
      };
    } catch (error) {
      console.error("Error during balance retrieval:", error);
      throw new Error("Failed to retrieve balance.");
    }
  
    
  }

  async airdrop(req):Promise<any>
  {
    try {
      const { pubKey } = req;
      if (!pubKey) {
        throw new Error("Public key is missing from the request.");
      }
      console.log("🚀 pubKey:", pubKey);
  
      // Request airdrop
      let airdropSignature: string;
      try {
        airdropSignature = await this.connection.requestAirdrop(
          new PublicKey(pubKey),
          2 * LAMPORTS_PER_SOL
        );
        console.log("🚀 ~ airdropSignature:", airdropSignature);
      } catch (error) {
        console.error("Error requesting airdrop:", error);
        throw new Error("Failed to request airdrop.");
      }
  
      // Get the latest blockhash
      let latestBlockHash: any;
      try {
        latestBlockHash = await this.connection.getLatestBlockhash();
        console.log("🚀 ~ latestBlockHash:", latestBlockHash);
      } catch (error) {
        console.error("Error fetching latest blockhash:", error);
        throw new Error("Failed to fetch latest blockhash.");
      }
  
      // Confirm the transaction
      let confirmTx: any;
      try {
        confirmTx = await this.connection.confirmTransaction({
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: airdropSignature,
        });
        console.log("🚀 ~ confirmTx:", confirmTx);
      } catch (error) {
        console.error("Error confirming transaction:", error);
        throw new Error("Failed to confirm transaction.");
      }
  
      return confirmTx;
    } catch (error) {
      console.error("Error during airdrop process:", error);
      throw new Error("Failed to process airdrop request.");
    }

  }

  async sendSolana(TransferDetails):Promise<any>
  {
    try {
      const { from, to, amount } = TransferDetails;
      console.log("🚀 ~ TransferDetails:", TransferDetails);
      const secret = process.env.SECRET_KEY;
      console.log("🚀 ~ secret:", secret)
      if (!secret) {
        throw new Error("SECRET_KEY environment variable is not set.");
      }

      console.log("🚀 ~ secret:", secret);

      const secretKeyArray = JSON.parse(secret);

      const secretKey = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
      console.log("🚀 ~ secretKey:", secretKey);
  
      const fromPublicKey = new PublicKey(from);
      console.log("🚀 ~ fromPublicKey:", fromPublicKey);
  
      const toPublicKey = new PublicKey(to);
      console.log("🚀 ~ toPublicKey:", toPublicKey);
  
      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );
  
      const connectionObj = await this.connection;
      console.log("🚀 ~ connectionObj:", connectionObj);
  
      const txHash = await sendAndConfirmTransaction(connectionObj, transferTransaction, [secretKey]);
      console.log("🚀 ~ sendAndConfirmTransaction:", txHash);
      
      return txHash;
    } catch (error) {
      console.error("Error during Solana transfer:", error);
      throw new Error("Failed to transfer Solana funds.");
    }
  }

  async generateKeyPair() {
    try {
      const keypair = Keypair.generate();
      console.log("🚀 ~ generateKeypair ~ keypair:", keypair);
      
      const publicKey = new PublicKey(keypair.publicKey);
    
      // Convert the public key to a base-58 string
      const publicKeyString = publicKey.toBase58();
      console.log("🚀 ~ generateKeyPair ~ publicKeyString:", publicKeyString)


      return {
        publicKey:publicKeyString,
        secretKey:keypair.secretKey
      };
    } catch (error) {
      console.error("Error generating keypair:", error);
      throw new Error("Failed to generate keypair");
    }
  }

  
}
