use crate::errors::ErrorCode;
use crate::schema::pool::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

#[event]
pub struct SwapEvent {
  pub authority: Pubkey,
  pub pool: Pubkey,
  pub a: u64,
  pub b: u64,
}

#[derive(Accounts)]
pub struct Swap<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(mut)]
  pub pool: Account<'info, Pool>,
  #[account(mut)]
  pub src_x_account: Account<'info, token::TokenAccount>,
  #[account(
    init_if_needed,
    payer = authority,
    associated_token::mint = y_token,
    associated_token::authority = authority
  )]
  pub dst_y_account: Account<'info, token::TokenAccount>,
  #[account(seeds = [b"treasurer", &pool.key().to_bytes()], bump)]
  /// CHECK: Just a pure account
  pub treasurer: AccountInfo<'info>,
  #[account(mut)]
  pub x_treasury: Box<Account<'info, token::TokenAccount>>,
  #[account(mut)]
  pub y_treasury: Box<Account<'info, token::TokenAccount>>,
  pub x_token: Box<Account<'info, token::Mint>>,
  pub y_token: Box<Account<'info, token::Mint>>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, token::Token>,
  pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn exec(ctx: Context<Swap>, a: u64) -> Result<()> {
  let pool = &mut ctx.accounts.pool;
  if a <= 0 {
    return err!(ErrorCode::InvalidAmount);
  }

  let (b, x_, y_) = pool.swap(a).ok_or(ErrorCode::Overflow)?;

  let transfer_a_ctx = CpiContext::new(
    ctx.accounts.token_program.to_account_info(),
    token::Transfer {
      from: ctx.accounts.src_x_account.to_account_info(),
      to: ctx.accounts.x_treasury.to_account_info(),
      authority: ctx.accounts.authority.to_account_info(),
    },
  );
  token::transfer(transfer_a_ctx, a)?;

  let seeds: &[&[&[u8]]] = &[&[
    b"treasurer".as_ref(),
    &pool.key().to_bytes(),
    &[*ctx.bumps.get("treasurer").ok_or(ErrorCode::NoBump)?],
  ]];

  let transfer_b_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    token::Transfer {
      from: ctx.accounts.y_treasury.to_account_info(),
      to: ctx.accounts.dst_y_account.to_account_info(),
      authority: ctx.accounts.treasurer.to_account_info(),
    },
    seeds,
  );
  token::transfer(transfer_b_ctx, b)?;

  pool.x = x_;
  pool.y = y_;

  emit!(SwapEvent {
    authority: pool.authority.key(),
    pool: pool.key(),
    a,
    b,
  });

  Ok(())
}
