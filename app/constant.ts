import bs58 from 'bs58'
import { BorshAccountsCoder } from '@project-serum/anchor'

import { IDL } from '../target/types/solance_core'

export const DEFAULT_RPC_ENDPOINT = 'https://api.devnet.solana.com'
// export const DEFAULT_PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
export const DEFAULT_PROGRAM_ID = '593Pj7uEyxExsxUiVV55bDScRzyEM9L7d5UUjjSRUbpv'
export const DEFAULT_IDL = IDL

export const POOL_DISCRIMINATOR = bs58.encode(
  BorshAccountsCoder.accountDiscriminator('pool'),
)
