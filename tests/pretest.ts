import {
  web3,
  AnchorProvider,
  Program,
  SplToken,
  BN,
  utils,
} from "@project-serum/anchor";
var CRC32 = require("crc-32");

export const asyncWait = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000));
export const toCrc32 = (str) => {
  let a = CRC32.buf(Buffer.from(str, "binary"), 0) >>> 0; // to unsigned int
  console.log("tocrc32", a);
  return a.toString();
};
export const getCurrentTimestamp = async (
  connection: web3.Connection
): Promise<number> => {
  const { data } =
    (await connection.getAccountInfo(web3.SYSVAR_CLOCK_PUBKEY)) || {};
  if (!data) throw new Error("Cannot read clock data");
  const bn = new BN(data.subarray(32, 40), "le");
  return bn.toNumber();
};

export const initializeMint = async (
  decimals: number,
  token: web3.Keypair,
  splProgram: Program<SplToken>
) => {
  const ix = await (splProgram.account as any).mint.createInstruction(token);
  const tx = new web3.Transaction().add(ix);
  const provider = splProgram.provider as AnchorProvider;
  await provider.sendAndConfirm(tx, [token]);
  return await splProgram.rpc.initializeMint(
    decimals,
    provider.wallet.publicKey,
    provider.wallet.publicKey,
    {
      accounts: {
        mint: token.publicKey,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    }
  );
};

export const initializeAccount = async (
  tokenAccount: web3.PublicKey,
  token: web3.PublicKey,
  authority: web3.PublicKey,
  provider: AnchorProvider
) => {
  const ix = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: provider.wallet.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: tokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: authority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: token,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: utils.token.TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: utils.token.ASSOCIATED_PROGRAM_ID,
    data: Buffer.from([]),
  });
  const tx = new web3.Transaction().add(ix);
  return await provider.sendAndConfirm(tx);
};

export const mintTo = async (
  amount: BN,
  token: web3.PublicKey,
  tokenAccount: web3.PublicKey,
  splProgram: Program<SplToken>
) => {
  const provider = splProgram.provider as AnchorProvider;
  await splProgram.methods
    .mintTo(amount)
    .accounts({
      mint: token,
      to: tokenAccount,
      authority: provider.wallet.publicKey,
    })
    .rpc();
};

export const transferLamports = async (
  lamports: number,
  dstAddress: string,
  provider: AnchorProvider
) => {
  const ix = web3.SystemProgram.transfer({
    fromPubkey: provider.wallet.publicKey,
    toPubkey: new web3.PublicKey(dstAddress),
    lamports: Number(lamports),
  });
  const tx = new web3.Transaction().add(ix);
  return await provider.sendAndConfirm(tx);
};
