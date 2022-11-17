import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NftMinting } from "../target/types/nft_minting";

describe("nft_minting", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.NftMinting as Program<NftMinting>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
