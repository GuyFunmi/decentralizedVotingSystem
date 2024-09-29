import {
    Clarinet,
    Tx,
    Chain,
    Account,
    assertEquals,
  } from "@clarinet/core";
  import { describe, it } from "vitest";
  
  describe("Election Manager Contract", () => {
    
    it("should start the voting phase by the admin", async () => {
      const chain = new Chain();
      const admin = chain.accounts.get('deployer')!;
      const block = chain.mineBlock([
        Tx.contractCall("election-manager", "start-voting", [], admin.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(ok true)");
  
      const electionPhase = chain.callReadOnlyFn(
        "election-manager", "get-election-phase", [], admin.address);
      assertEquals(electionPhase.result, "u1");  // Phase should now be voting
    });
  
    it("should fail to start voting by a non-admin", async () => {
      const chain = new Chain();
      const nonAdmin = chain.accounts.get('wallet_1')!;
      const block = chain.mineBlock([
        Tx.contractCall("election-manager", "start-voting", [], nonAdmin.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(err u102)");  // Should fail because non-admin called it
    });
  
    it("should end the election by the admin", async () => {
      const chain = new Chain();
      const admin = chain.accounts.get('deployer')!;
      const block = chain.mineBlock([
        Tx.contractCall("election-manager", "end-election", [], admin.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(ok true)");
  
      const electionPhase = chain.callReadOnlyFn(
        "election-manager", "get-election-phase", [], admin.address);
      assertEquals(electionPhase.result, "u2");  // Phase should now be closed
    });
  
    it("should fail to end the election when it’s not in voting phase", async () => {
      const chain = new Chain();
      const admin = chain.accounts.get('deployer')!;
      const block = chain.mineBlock([
        Tx.contractCall("election-manager", "end-election", [], admin.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(err u103)");  // Should fail because the election isn't in the voting phase
    });
  
    it("should allow adding a candidate during registration phase", async () => {
      const chain = new Chain();
      const admin = chain.accounts.get('deployer')!;
      
      // Ensure we are in the registration phase
      chain.mineBlock([
        Tx.contractCall("election-manager", "reset-election-phase", ["u0"], admin.address)  // Assuming reset functionality
      ]);
  
      const block = chain.mineBlock([
        Tx.contractCall("election-manager", "add-candidate", ["u1", "'Alice'"], admin.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(ok true)");
  
      const candidate = chain.callReadOnlyFn(
        "election-manager", "get-candidate", ["u1"], admin.address);
      assertEquals(candidate.result, "(some {name: \"Alice\", voteCount: u0})");
    });
  
    it("should fail to vote when not in voting phase", async () => {
      const chain = new Chain();
      const voter = chain.accounts.get('wallet_1')!;
  
      // Ensure we are in the registration phase
      const block = chain.mineBlock([
        Tx.contractCall("election-manager", "vote", ["u1"], voter.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(err u103)");  // Should fail since it's not the voting phase
    });
  
    it("should allow voting in the voting phase", async () => {
      const chain = new Chain();
      const admin = chain.accounts.get('deployer')!;
      const voter = chain.accounts.get('wallet_1')!;
  
      // Start voting phase
      chain.mineBlock([
        Tx.contractCall("election-manager", "start-voting", [], admin.address)
      ]);
  
      // Cast vote
      const block = chain.mineBlock([
        Tx.contractCall("election-manager", "vote", ["u1"], voter.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(ok true)");
  
      const candidate = chain.callReadOnlyFn(
        "election-manager", "get-candidate", ["u1"], admin.address);
      assertEquals(candidate.result, "(some {name: \"Alice\", voteCount: u1})");
    });
  
  });
  