use crate::errors::ErrorCode;
use crate::schema::pool::*;
use crate::schema::user::*;
use anchor_lang::prelude::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::log::sol_log_compute_units;
use anchor_spl::token::{self, Token};
use std::mem::size_of;

#[derive(Accounts)]
pub struct CreateUser<'info> {
  // // Authenticate state account
  // #[account(mut, seeds = [b"state".as_ref()], bump)]
  // pub state: Account<'info, StateAccount>,

  // Authenticate user account
  #[account(
        init,
        // User account use string "user" and index of user as seeds
        seeds = [b"user".as_ref(), authority.key().as_ref()],
        bump,
        payer = authority,
        space = size_of::<User>() + User::USER_NAME_LENGTH + User::USER_URL_LENGTH + 8
    )]
  pub user: Account<'info, User>,

  // Authority (this is signer who paid transaction fee)
  #[account(mut)]
  pub authority: Signer<'info>,
  /// System program
  /// CHECK: Simple test account 
  pub system_program: UncheckedAccount<'info>,
  // // Token program
  #[account(constraint = token_program.key == &token::ID)]
  pub token_program: Program<'info, Token>,
  // Clock to save time
  pub clock: Sysvar<'info, Clock>,
}

pub fn exec(
  ctx: Context<CreateUser>,
  name: String,
  profile_url: String,
  user_role: String,
) -> Result<()> {
  let user = &mut ctx.accounts.user;
  // let state = &mut ctx.accounts.state;

  // Set authority
  user.user_wallet_address = ctx.accounts.authority.key();
  // Set text
  user.user_name = name;
  user.user_role = user_role;
  user.user_profile_image_url = profile_url;
 
  msg!("User Added!"); //logging
  sol_log_compute_units(); //Logs how many compute units are left, important for budget
  Ok(())
}
