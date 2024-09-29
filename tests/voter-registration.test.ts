import {
    Clarinet,
    Tx,
    Chain,
    Account,
    assertEquals,
  } from "@clarinet/core";
  import { describe, it } from "vitest";
  
  describe("Voter Registration Contract", () => {
  
    it("should allow a user to register as a voter", async () => {
      const chain = new Chain();
      const wallet = chain.accounts.get('wallet_1')!;
  
      const block = chain.mineBlock([
        Tx.contractCall("voter-registration", "register-voter", [], wallet.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(ok true)");
  
      const voter = chain.callReadOnlyFn(
        "voter-registration", "get-registered-voter", [wallet.address], wallet.address
      );
      assertEquals(voter.result, "(some {registered: true})");
    });
  
    it("should prevent an unregistered user from voting", async () => {
      const chain = new Chain();
      const wallet = chain.accounts.get('wallet_2')!;
  
      const block = chain.mineBlock([
        Tx.contractCall("voter-registration", "vote", ["u1"], wallet.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(err u104)");  // Error: not registered
    });
  
    it("should allow a registered user to vote", async () => {
      const chain = new Chain();
      const wallet = chain.accounts.get('wallet_1')!;
  
      // Register the user first
      chain.mineBlock([
        Tx.contractCall("voter-registration", "register-voter", [], wallet.address)
      ]);
  
      // Cast vote
      const block = chain.mineBlock([
        Tx.contractCall("voter-registration", "vote", ["u1"], wallet.address)
      ]);
  
      const result = block.receipts[0].result;
      assertEquals(result, "(ok true)");  // Successful vote
    });
  
  });
  