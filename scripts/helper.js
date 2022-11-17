import fs from "fs";
import * as anchor from "@project-serum/anchor";
import pkg from "@solana/web3.js";
const { Keypair, Publickey, Connection, clusterApiUrl, Transaction } = pkg;

export async function getWallet() {
  const key = fs.readFileSync("./key.json", "utf-8");
  const keyPair = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(key))
  );
  const wallet = new anchor.Wallet(keyPair);

  return wallet;
}
export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID =
  new anchor.web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

export const programAddress = new anchor.web3.PublicKey(
  "5GazsE1oEPBpPWSc7UFAyNr2LfTSpBKQ8AX7was68VqY"
);

export async function getProgram(wallet) {
  const connection = new Connection(clusterApiUrl("devnet"));
  const options = anchor.AnchorProvider.defaultOptions();
  const provider = new anchor.AnchorProvider(connection, wallet, options);
  const idl = await anchor.Program.fetchIdl(programAddress, provider);
  const program = new anchor.Program(idl, programAddress, provider);

  return program;
}
