import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanceCore } from "../target/types/solance_core";
import {
  AnchorProvider,
  setProvider,
  workspace,
  Spl,
  web3,
  BN,
  utils,
} from "@project-serum/anchor";
import { initializeAccount, initializeMint, mintTo } from "./pretest";
import { expect } from "chai";
export function programPaidBy(
  program: anchor.Program,
  connection: anchor.web3.Connection,
  payer: anchor.web3.Keypair
): anchor.Program {
  const newProvider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(payer),
    {}
  );

  return new anchor.Program(
    program.idl as anchor.Idl,
    program.programId,
    newProvider
  );
}

describe("solance_core", () => {
  // Configure the client to use the local cluster.
  //For your anchor tests, it will use the provider.wallet as the payer and thus automatically use the provider.wallet as the signer.
  const provider = AnchorProvider.env();
  setProvider(provider);
  provider.connection;
  const program = anchor.workspace.SolanceCore as Program<SolanceCore>;

  const spl = Spl.token();

  const xToken = new web3.Keypair();
  let xTokenAccount: web3.PublicKey;

  const yToken = new web3.Keypair();
  let yTokenAccount: web3.PublicKey;

  const pool = new web3.Keypair();

  let treasurer: web3.PublicKey;
  let xTreasury: web3.PublicKey;
  let yTreasury: web3.PublicKey;

  before(async () => {
    // Init mints
    await initializeMint(6, xToken, spl); // token usually has 6 - 9 decimal ->> create SLP token
    await initializeMint(6, yToken, spl);
    // Init accounts
    xTokenAccount = await utils.token.associatedAddress({
      mint: xToken.publicKey,
      owner: provider.wallet.publicKey,
    });

    await initializeAccount(
      xTokenAccount,
      xToken.publicKey,
      provider.wallet.publicKey,
      provider
    );

    yTokenAccount = await utils.token.associatedAddress({
      mint: yToken.publicKey,
      owner: provider.wallet.publicKey,
    });

    await initializeAccount(
      yTokenAccount,
      yToken.publicKey,
      provider.wallet.publicKey,
      provider
    );
    // Mint tokens
    await mintTo(new BN("1000000000000"), xToken.publicKey, xTokenAccount, spl);
    await mintTo(new BN("1000000000000"), yToken.publicKey, yTokenAccount, spl);

    // Derive treasury & treasurer
    const [treasurerPublicKey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("treasurer"), pool.publicKey.toBuffer()],
      program.programId
    );

    treasurer = treasurerPublicKey;

    xTreasury = await utils.token.associatedAddress({
      mint: xToken.publicKey,
      owner: treasurer,
    });

    yTreasury = await utils.token.associatedAddress({
      mint: yToken.publicKey,
      owner: treasurer,
    });
  });
  it("Create pool", async () => {
    // Derive treasury & treasurer
    const [userPublicKey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("user"), provider.publicKey.toBuffer()],
      program.programId
    );

    // Add your test here.
    const txId = await program.methods
      .createUser("name7", "SERVICE_OWNER", "url.com")
      .accounts({
        user: userPublicKey,
        authority: provider.publicKey,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      // .signers([pool])
      .rpc();
    expect(txId).to.be.an("string");
  });
});
