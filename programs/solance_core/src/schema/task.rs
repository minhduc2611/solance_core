use crate::constants::*;
use anchor_lang::prelude::*;
use num_traits::ToPrimitive;

#[account]
pub struct Task {
  pub hashed_seed: String,
  pub id: String,
  pub state: String,
  pub name: String,
}

impl Task {
  pub const LEN: usize = DISCRIMINATOR_SIZE 
    + U64_SIZE 
    + U64_SIZE 
    + U64_SIZE 
    + U64_SIZE;
}
