use crate::constants::*;
use anchor_lang::prelude::*;
use num_traits::ToPrimitive;

#[account]
pub struct Task {

  // task seed
  pub hashed_seed: String,

  // task id
  pub id: String,

  // task contract state
  pub state: String,

  // task name
  pub name: String,
 
  // owner who pay the rent
  pub authority: Pubkey,

  // provider who apply for task, can be null
  pub provider: Pubkey,

  // amount of award
  pub amount: u64,

  // award token: SOL/USDC
  pub token: Pubkey,
}

impl Task {
  pub const LEN: usize = DISCRIMINATOR_SIZE 
    + U64_SIZE 
    + U64_SIZE 
    + U64_SIZE 
    + U64_SIZE;
}
