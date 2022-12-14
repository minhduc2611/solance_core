use crate::constants::*;
use anchor_lang::prelude::*;
use num_traits::ToPrimitive;

#[account]
pub struct Task {
  pub id: String,
  pub state: String,
  pub name: String,
}

// CONTRACT.CONDITION_ISSUED
// CONTRACT.CONDITION_REQUESTED
// CONTRACT.CONDITION_AGREED
// CONTRACT.CONDITION_NOT_MEET
// CONTRACT.CONDITION_ALL_MEET

impl Task {
  pub const LEN: usize = DISCRIMINATOR_SIZE 
    + U64_SIZE 
    + U64_SIZE 
    + U64_SIZE;
}
