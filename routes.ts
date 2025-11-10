import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { verifyCommitment, canWithdraw, timeUntilWithdrawal } from "@shared/mixer";
import { insertMixerDepositSchema, insertMixerWithdrawalSchema } from "@shared/schema";
import bs58 from "bs58";

// Initialize Solana connection (devnet)
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Mixer wallet loaded from environment secret
let mixerWallet: Keypair;

function getMixerWallet(): Keypair {
  if (!mixerWallet) {
    const privateKeyString = process.env.MIXER_WALLET_PRIVATE_KEY;
    
    if (!privateKeyString) {
      throw new Error('MIXER_WALLET_PRIVATE_KEY environment variable not set!');
    }
    
    try {
      // Parse the private key (comma-separated numbers or JSON array)
      const privateKeyArray = privateKeyString.startsWith('[')
        ? JSON.parse(privateKeyString)
        : privateKeyString.split(',').map(n => parseInt(n.trim()));
      
      const secretKey = Uint8Array.from(privateKeyArray);
      mixerWallet = Keypair.fromSecretKey(secretKey);
      
      console.log('✅ Mixer wallet loaded successfully!');
      console.log('📍 Mixer address:', mixerWallet.publicKey.toBase58());
    } catch (error) {
      console.error('Failed to load mixer wallet:', error);
      throw new Error('Invalid MIXER_WALLET_PRIVATE_KEY format');
    }
  }
  return mixerWallet;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get mixer configuration
  app.get("/api/mixer/config", async (req, res) => {
    try {
      const config = await storage.getMixerConfig();
      const mixerAddress = getMixerWallet().publicKey.toBase58();
      
      res.json({
        mixerAddress,
        minimumAnonymitySet: config.minimumAnonymitySet,
        minimumDelayMinutes: config.minimumDelayMinutes,
        fixedDepositAmount: config.fixedDepositAmount,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get pool status
  app.get("/api/mixer/status", async (req, res) => {
    try {
      const config = await storage.getMixerConfig();
      const unwithdrawnCount = await storage.getUnwithdrawnDepositsCount();
      const mixerAddress = getMixerWallet().publicKey.toBase58();
      
      // Get mixer wallet balance
      const balance = await connection.getBalance(getMixerWallet().publicKey);
      
      res.json({
        mixerAddress,
        anonymitySetSize: unwithdrawnCount,
        minimumAnonymitySet: config.minimumAnonymitySet,
        minimumDelayMinutes: config.minimumDelayMinutes,
        poolBalance: balance,
        fixedDepositAmount: config.fixedDepositAmount,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Deposit to mixer
  app.post("/api/mixer/deposit", async (req, res) => {
    try {
      const depositData = insertMixerDepositSchema.parse(req.body);
      
      // Get mixer config for fixed deposit amount
      const config = await storage.getMixerConfig();
      
      // Verify the deposit transaction exists and is confirmed
      const signature = depositData.depositSignature;
      const txInfo = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      
      if (!txInfo || !txInfo.meta) {
        return res.status(400).json({ error: "Transaction not found or not confirmed" });
      }
      
      // Verify transaction was successful
      if (txInfo.meta.err) {
        return res.status(400).json({ error: "Transaction failed on-chain" });
      }
      
      // Verify amount matches fixed deposit amount
      if (depositData.amount !== config.fixedDepositAmount) {
        return res.status(400).json({ 
          error: `Invalid deposit amount. Must deposit exactly ${config.fixedDepositAmount} lamports (${config.fixedDepositAmount / LAMPORTS_PER_SOL} SOL)` 
        });
      }
      
      // Parse transaction to verify actual lamport transfer to mixer
      const mixerPubkey = getMixerWallet().publicKey;
      const txAccounts = txInfo.transaction.message.getAccountKeys();
      
      // Find mixer wallet index in account keys
      const mixerIndex = txAccounts.staticAccountKeys.findIndex(
        key => key.equals(mixerPubkey)
      );
      
      if (mixerIndex === -1) {
        return res.status(400).json({ error: "Mixer address not found in transaction" });
      }
      
      // Verify balance change for mixer wallet
      const preBalance = txInfo.meta.preBalances[mixerIndex];
      const postBalance = txInfo.meta.postBalances[mixerIndex];
      const actualTransfer = postBalance - preBalance;
      
      // Allow for small rent/fee differences, but verify close to expected amount
      const minAcceptable = config.fixedDepositAmount - 5000; // Allow 5000 lamports margin for fees
      const maxAcceptable = config.fixedDepositAmount + 5000;
      
      if (actualTransfer < minAcceptable || actualTransfer > maxAcceptable) {
        return res.status(400).json({ 
          error: `Invalid transfer amount. Expected ~${config.fixedDepositAmount} lamports, got ${actualTransfer} lamports` 
        });
      }
      
      // CRITICAL: Verify commitment is from the actual depositor (prevent front-running)
      // Check if commitment is in transaction memo
      const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
      const instructions = txInfo.transaction.message.instructions;
      let foundCommitment = false;
      
      for (const ix of instructions) {
        // Check if this is a memo instruction
        const programId = txAccounts.staticAccountKeys[ix.programIdIndex];
        if (programId.toBase58() === MEMO_PROGRAM_ID && ix.data) {
          try {
            // Decode base58 instruction data
            const decodedData = bs58.decode(ix.data);
            const dataStr = Buffer.from(decodedData).toString('utf-8');
            
            // Check if our commitment is in the memo
            if (dataStr.includes(depositData.commitment)) {
              foundCommitment = true;
              break;
            }
          } catch (error) {
            console.error('Error decoding memo:', error);
          }
        }
      }
      
      if (!foundCommitment) {
        return res.status(400).json({ 
          error: "Commitment not found in transaction memo. Must include commitment in transaction to prevent front-running attacks." 
        });
      }
      
      // Check for signature replay (unique constraint will also catch this)
      const existing = await storage.getDepositByCommitment(depositData.commitment);
      if (existing) {
        return res.status(409).json({ error: "Commitment already exists" });
      }
      
      // Store deposit in database
      const deposit = await storage.createDeposit(depositData);
      
      res.json({
        success: true,
        depositId: deposit.id,
        commitment: deposit.commitment,
        depositedAt: deposit.depositedAt,
        actualTransferred: actualTransfer,
        message: "Deposit recorded successfully. Please save your secret for withdrawal.",
      });
    } catch (error: any) {
      console.error('Deposit error:', error);
      
      // Handle unique constraint violation
      if (error.message?.includes('unique') || error.code === '23505') {
        return res.status(409).json({ error: "This transaction has already been used for a deposit" });
      }
      
      res.status(400).json({ error: error.message });
    }
  });

  // Withdraw from mixer
  app.post("/api/mixer/withdraw", async (req, res) => {
    try {
      const { secret, nullifier, recipientAddress } = req.body;
      
      if (!secret || !nullifier || !recipientAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Generate commitment from secret and nullifier
      const crypto = require('crypto');
      const commitment = crypto.createHash('sha256').update(Buffer.concat([
        Buffer.from(secret, 'hex'),
        Buffer.from(nullifier, 'hex')
      ])).digest('hex');
      
      // Find deposit by commitment
      const deposit = await storage.getDepositByCommitment(commitment);
      
      if (!deposit) {
        return res.status(404).json({ error: "Deposit not found for this commitment" });
      }
      
      if (deposit.withdrawn) {
        return res.status(409).json({ error: "This deposit has already been withdrawn" });
      }
      
      // Check anonymity set
      const config = await storage.getMixerConfig();
      const anonymitySetSize = await storage.getUnwithdrawnDepositsCount();
      
      if (anonymitySetSize < config.minimumAnonymitySet) {
        return res.status(425).json({ 
          error: `Insufficient anonymity set. Need ${config.minimumAnonymitySet} deposits, currently ${anonymitySetSize}.`,
          anonymitySetSize,
          minimumRequired: config.minimumAnonymitySet,
        });
      }
      
      // Check time delay
      if (!canWithdraw(new Date(deposit.depositedAt), config.minimumDelayMinutes)) {
        const remaining = timeUntilWithdrawal(new Date(deposit.depositedAt), config.minimumDelayMinutes);
        return res.status(425).json({ 
          error: "Minimum time delay not met",
          timeRemainingMs: remaining,
          minimumDelayMinutes: config.minimumDelayMinutes,
        });
      }
      
      // Atomically mark as withdrawn (prevents double-withdrawal)
      const marked = await storage.markDepositAsWithdrawn(deposit.id, new Date());
      
      if (!marked) {
        return res.status(409).json({ error: "Deposit was already withdrawn (race condition)" });
      }
      
      try {
        // Send SOL to recipient from mixer wallet
        const recipientPubkey = new PublicKey(recipientAddress);
        const mixerWalletKeypair = getMixerWallet();
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: mixerWalletKeypair.publicKey,
            toPubkey: recipientPubkey,
            lamports: deposit.amount,
          })
        );
        
        const signature = await connection.sendTransaction(transaction, [mixerWalletKeypair]);
        const confirmation = await connection.confirmTransaction(signature, "confirmed");
        
        // Check if transaction actually succeeded
        if (confirmation.value.err) {
          // Transaction failed - revert withdrawal
          await storage.revertWithdrawal(deposit.id);
          
          console.error('Transaction failed on-chain:', confirmation.value.err);
          return res.status(500).json({ 
            error: "Transaction failed on-chain. Withdrawal reverted, you can try again.",
            signature,
            details: confirmation.value.err,
          });
        }
        
        // Record withdrawal only if transaction succeeded
        const withdrawal = await storage.createWithdrawal({
          depositId: deposit.id,
          recipientAddress,
          withdrawalSignature: signature,
        });
        
        res.json({
          success: true,
          withdrawalId: withdrawal.id,
          signature,
          recipientAddress,
          amount: deposit.amount,
          message: "Withdrawal successful! Your SOL has been sent to the recipient address.",
        });
      } catch (txError: any) {
        // Rollback: revert withdrawal flag so user can retry
        await storage.revertWithdrawal(deposit.id);
        
        console.error('Transaction error:', txError);
        return res.status(500).json({ 
          error: "Failed to send transaction. Withdrawal reverted, you can try again.",
          details: txError.message,
        });
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
