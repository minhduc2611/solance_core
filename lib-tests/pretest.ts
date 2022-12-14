import {
  AnchorProvider,
  Program,
  SplToken,
  utils,
  web3,
  BN,
} from '@project-serum/anchor'

export const initializeMint = async (
  decimals: number,
  token: web3.Keypair,
  splProgram: Program<SplToken>,
) => {
  const ix = await (splProgram.account as any).mint.createInstruction(token)
  const tx = new web3.Transaction().add(ix)
  const provider = splProgram.provider as AnchorProvider
  await provider.sendAndConfirm(tx, [token])
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
    },
  )
}

export const initializeAccount = async (
  associatedTokenAddress: string,
  tokenAddress: string,
  authority: web3.PublicKey,
  provider: AnchorProvider,
) => {
  const ix = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: provider.wallet.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: new web3.PublicKey(associatedTokenAddress),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: authority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: new web3.PublicKey(tokenAddress),
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
  })
  const tx = new web3.Transaction().add(ix)
  return await provider.sendAndConfirm(tx)
}

export const mintTo = async (
  amount: BN,
  token: web3.PublicKey,
  tokenAccount: web3.PublicKey,
  splProgram: Program<SplToken>,
) => {
  const provider = splProgram.provider as AnchorProvider
  await splProgram.methods
    .mintTo(amount)
    .accounts({
      mint: token,
      to: tokenAccount,
      authority: provider.wallet.publicKey,
    })
    .rpc()
}

export const asyncWait = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s))
