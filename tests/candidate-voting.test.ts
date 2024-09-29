import {
    Clarinet,
    Tx,
    Chain,
    Account,
    assertEquals,
  } from "@clarinet/core";
  import { describe, it } from "vitest";
  
  describe("Candidate and Voting Contract", () => {
  
    it("should allow adding a candidate", async () => {
      const chain = new Chain();
      const admin = chain.accounts.get('deployer')!;
  
      const block = chain.mineBlock([
        Tx.contractCall("candidate-voting", "add-candidate", ["u1", "'Alice'"], admin.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(ok true)");
  
      const candidate = chain.callReadOnlyFn(
        "candidate-voting", "get-candidate", ["u1"], admin.address);
      assertEquals(candidate.result, "(some {name: \"Alice\", voteCount: u0})");
    });
  
    it("should prevent voting for a non-existent candidate", async () => {
      const chain = new Chain();
      const voter = chain.accounts.get('wallet_1')!;
  
      const block = chain.mineBlock([
        Tx.contractCall("candidate-voting", "vote", ["u2"], voter.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(err u101)");  // Candidate not found error
    });
  
    it("should allow voting for an existing candidate", async () => {
      const chain = new Chain();
      const admin = chain.accounts.get('deployer')!;
      const voter = chain.accounts.get('wallet_1')!;
  
      // Add a candidate
      chain.mineBlock([
        Tx.contractCall("candidate-voting", "add-candidate", ["u1", "'Alice'"], admin.address)
      ]);
  
      // Cast a vote for that candidate
      const block = chain.mineBlock([
        Tx.contractCall("candidate-voting", "vote", ["u1"], voter.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(ok true)");
  
      const candidate = chain.callReadOnlyFn(
        "candidate-voting", "get-candidate", ["u1"], admin.address);
      assertEquals(candidate.result, "(some {name: \"Alice\", voteCount: u1})");
    });
  
    it("should prevent double voting by the same user", async () => {
      const chain = new Chain();
      const admin = chain.accounts.get('deployer')!;
      const voter = chain.accounts.get('wallet_1')!;
  
      // Add a candidate
      chain.mineBlock([
        Tx.contractCall("candidate-voting", "add-candidate", ["u1", "'Alice'"], admin.address)
      ]);
  
      // First vote
      chain.mineBlock([
        Tx.contractCall("candidate-voting", "vote", ["u1"], voter.address)
      ]);
  
      // Try to vote again (should fail)
      const block = chain.mineBlock([
        Tx.contractCall("candidate-voting", "vote", ["u1"], voter.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(err u100)");  // Error: already voted
    });
  
  });
  