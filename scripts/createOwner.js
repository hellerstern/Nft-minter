import { getProgram, getWallet, programAddress } from "./helper.js";
import pkg from "@solana/web3.js";
const { Transaction, Connection, clusterApiUrl } = pkg;
import * as anchor from "@project-serum/anchor";
const { SystemProgram } = anchor.web3;

const wallet = await getWallet();
const program = await getProgram(wallet);
const connection = new Connection(clusterApiUrl("devnet"));

async function create_owner() {
  const owners = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("owner")],
    programAddress
  );

  const tx = await program.methods
    .createAuthority()
    .accounts({
      owner: wallet.publicKey,
      owners: owners[0],
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  let ix = new Transaction();

  ix.add(tx);
  ix.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  ix.feePayer = wallet.publicKey;

  wallet.signTransaction(ix);

  const sign = await connection.sendRawTransaction(ix.serialize());

  const hash = await connection.confirmTransaction(sign, "confirmed");
  console.log(hash);
}
create_owner();
