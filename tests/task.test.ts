import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanceCore } from "../target/types/solance_core";
import { v4 as uuidv4 } from "uuid";

import {
  AnchorProvider,
  setProvider,
  workspace,
  Spl,
  web3,
  BN,
  utils,
} from "@project-serum/anchor";
import { initializeAccount, initializeMint, mintTo, toCrc32 } from "./pretest";
import { expect } from "chai";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";


describe.only("Task", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  setProvider(provider);

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
 
  const taskInput1 = {
    id: toCrc32(uuidv4()),
    idx: "uuidv2",
    name: "MOCK TASK",
  };
  const taskInput2 = {
    id: toCrc32(uuidv4()),
    idx: "uuidv5",
    name: "MOCK TASK2",
  };

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
  it("Create task #1", async () => {
    // Derive treasury & treasurer
    const [task_pda] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("task_issuing"), utf8.encode(taskInput1.id)],
      program.programId
    );

    const txId = await program.methods
      .taskCreateAndIssueCond(taskInput1.id, taskInput1.name)
      .accounts({
        task: task_pda,
        authority: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();
    expect(txId).to.be.an("string");
  });
  it("Create task #2", async () => {
    const [task_pda] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("task_issuing"), utf8.encode(taskInput2.id)],
      program.programId
    );

    const txId = await program.methods
      .taskCreateAndIssueCond(taskInput2.id, taskInput2.name)
      .accounts({
        task: task_pda,
        authority: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();
    expect(txId).to.be.an("string");
  });

  // get data
  it("Get data #1", async () => {
    const a = await program.account.task.all();
    console.log("a", a);
    // a [
    //   {
    //     publicKey: PublicKey {
    //       _bn: <BN: 1ebaf421db8a9ce9e47a05f18ed76c3203cec256149c8a1a25a400576ec262e7>
    //     },
    //     account: { id: '2894232254', state: 'CONDITION_ISSUED', name: 'MOCK TASK2' }
    //   },
    //   {
    //     publicKey: PublicKey {
    //       _bn: <BN: a913a9b911bf17ba8269d11baf771d0d8b157ed8f6682f2355f01fe9be14c1cd>
    //     },
    //     account: { id: '2022668531', state: 'CONDITION_ISSUED', name: 'MOCK TASK' }
    //   }
    // ]
  });
});
