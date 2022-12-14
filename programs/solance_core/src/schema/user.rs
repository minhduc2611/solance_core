use crate::constants::*;
use anchor_lang::prelude::*;
use num_traits::ToPrimitive;

#[account]
pub struct User {
  // user name
  pub user_name: String,

  // SERVICE_OWNER | SERVICE_PROVIDER
  pub user_role: String,

  // user wallet address, unique
  pub user_wallet_address: Pubkey,

  // user profile image url
  pub user_profile_image_url: String,

  pub job_count: u64,

  // user index
  pub index: u64,
}

// enum UserRole {
//   ServiceOwner(String),
//   ServiceProvider(String),
// }

impl User {
  pub const LEN: usize =
    DISCRIMINATOR_SIZE + PUBKEY_SIZE + U64_SIZE + PUBKEY_SIZE + U64_SIZE + PUBKEY_SIZE;

  pub const USER_NAME_LENGTH: usize = 100;
  pub const USER_URL_LENGTH: usize = 250;

  // pub fn createUser(&self, a: String) -> Option<(u64, u64, u64)> {

  //   let a = UserRole::ServiceOwner(a);

  //   Some()
  // }
}
