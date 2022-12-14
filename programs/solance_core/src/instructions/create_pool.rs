use crate::errors::ErrorCode;
use crate::schema::pool::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

#[event]
pub struct CreatePoolEvent {
  pub authority: Pubkey,
  pub pool: Pubkey,
  pub x: u64,
  pub x_token: Pubkey,
  pub y: u64,
  pub y_token: Pubkey,
}

#[derive(Accounts)]
pub struct CreatePool<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(init, payer = authority, space = Pool::LEN)]
  pub pool: Account<'info, Pool>,
  pub x_token: Box<Account<'info, token::Mint>>,
  pub y_token: Box<Account<'info, token::Mint>>,
  #[account(mut)]
  pub src_x_account: Account<'info, token::TokenAccount>,
  #[account(mut)]
  pub src_y_account: Account<'info, token::TokenAccount>,
  #[account(seeds = [b"treasurer", &pool.key().to_bytes()], bump)]
  /// CHECK: Just a pure account
  pub treasurer: AccountInfo<'info>,
  #[account(
    init,
    payer = authority,
    associated_token::mint = x_token,
    associated_token::authority = treasurer
  )]
  pub x_treasury: Box<Account<'info, token::TokenAccount>>,
  #[account(
    init,
    payer = authority,
    associated_token::mint = y_token,
    associated_token::authority = treasurer
  )]
  pub y_treasury: Box<Account<'info, token::TokenAccount>>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, token::Token>,
  pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn exec(ctx: Context<CreatePool>, x: u64, y: u64) -> Result<()> {
  let pool = &mut ctx.accounts.pool;
  if x <= 0 || y <= 0 {
    return err!(ErrorCode::InvalidAmount);
  }

  let transfer_x_ctx = CpiContext::new(
    ctx.accounts.token_program.to_account_info(),
    token::Transfer {
      from: ctx.accounts.src_x_account.to_account_info(),
      to: ctx.accounts.x_treasury.to_account_info(),
      authority: ctx.accounts.authority.to_account_info(),
    },
  );
  token::transfer(transfer_x_ctx, x)?;

  let transfer_y_ctx = CpiContext::new(
    ctx.accounts.token_program.to_account_info(),
    token::Transfer {
      from: ctx.accounts.src_y_account.to_account_info(),
      to: ctx.accounts.y_treasury.to_account_info(),
      authority: ctx.accounts.authority.to_account_info(),
    },
  );
  token::transfer(transfer_y_ctx, y)?;

  // Create pool data
  pool.authority = ctx.accounts.authority.key();
  pool.x = x;
  pool.x_token = ctx.accounts.x_token.key();
  pool.y = y;
  pool.y_token = ctx.accounts.y_token.key();

  emit!(CreatePoolEvent {
    authority: pool.authority.key(),
    pool: pool.key(),
    x: pool.x,
    x_token: pool.x_token,
    y: pool.y,
    y_token: pool.y_token,
  });

  Ok(())
}
