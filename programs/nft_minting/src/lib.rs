use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::invoke;
use anchor_spl::token;
use anchor_spl::token::{ Mint, MintTo, Token, TokenAccount };
use mpl_token_metadata::instruction::{ create_metadata_accounts_v2, update_metadata_accounts_v2 };

declare_id!("5GazsE1oEPBpPWSc7UFAyNr2LfTSpBKQ8AX7was68VqY");

#[program]
pub mod nft_minting {
    use super::*;
    pub fn mint(
        ctx: Context<mint>,
        creator: Pubkey,
        metadata_uri: String,
        title: String,
        symbol: String
    ) -> Result<()> {
        if &ctx.accounts.owners.owner != &ctx.accounts.owner.to_account_info().key() {
            return err!(Errors::Unauthorized);
        }

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.ata.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::mint_to(cpi_ctx, 1)?;

        let account_info = vec![
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info()
        ];
        let creator = vec![mpl_token_metadata::state::Creator {
            address: ctx.accounts.owner.to_account_info().key(),
            verified: true,
            share: 100,
        }];

        let symbol = std::string::ToString::to_string(&symbol);
        invoke(
            &create_metadata_accounts_v2(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.authority.key(),
                ctx.accounts.owner.key(),
                ctx.accounts.owner.key(),
                title,
                symbol,
                metadata_uri,
                Some(creator),
                1,
                true,
                true,
                None,
                None
            ),
            account_info.as_slice()
        )?;
        msg!("Metadata Account Created !!!");

        Ok(())
    }

    pub fn update_metadata(
        ctx: Context<update_metadata>,
        creator: Pubkey,
        new_title: String,
        new_symbol: String,
        new_uri: String
    ) -> Result<()> {
        if &ctx.accounts.owners.owner != &ctx.accounts.owner.to_account_info().key() {
            return err!(Errors::Unauthorized);
        }
        let creator = vec![
            mpl_token_metadata::state::Creator {
                address: creator,
                verified: true,
                share: 100,
            },
            mpl_token_metadata::state::Creator {
                address: ctx.accounts.owner.key(),
                verified: false,
                share: 0,
            }
        ];

        let symbol = std::string::ToString::to_string(&new_symbol);

        let data = mpl_token_metadata::state::DataV2 {
            name: new_title,
            symbol: symbol,
            uri: new_uri,
            seller_fee_basis_points: 0,
            creators: Some(creator),
            collection: None,
            uses: None,
        };

        let account_infos = vec![
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info()
        ];

        invoke(
            &update_metadata_accounts_v2(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.owner.key(),
                None,
                Some(data),
                None,
                None
            ),
            account_infos.as_slice()
        )?;
        Ok(())
    }

    pub fn update_authority(ctx: Context<update_authority>) -> Result<()> {
        if &ctx.accounts.owners.owner != &ctx.accounts.owner.to_account_info().key() {
            return err!(Errors::Unauthorized);
        }
        ctx.accounts.owners.owner = ctx.accounts.new_owner.to_account_info().key();
        Ok(())
    }

    pub fn create_authority(ctx: Context<create_authority>) -> Result<()> {
        ctx.accounts.owners.owner = ctx.accounts.owner.to_account_info().key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct mint<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    ///CHECK
    #[account(mut)]
    pub beneficiary: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,

    ///CHECK
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: UncheckedAccount<'info>,
    ///CHECK
    #[account(init_if_needed, payer = owner, mint::decimals = 0, mint::authority = owner)]
    pub mint: Account<'info, Mint>,
    ///CHECK
    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = beneficiary
    )]
    pub ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            b"owner",
        ],
        bump
    )]
    pub owners: Account<'info, Owners>,
    ///CHECK
    pub token_metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
    ///CHECK
    pub associated_token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct update_metadata<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    ///CHECK
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    ///CHECK
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            b"owner",
        ],
        bump
    )]
    pub owners: Account<'info, Owners>,

    ///CHECK
    pub token_metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct update_authority<'info> {
    ///CHECK
    #[account(mut)]
    pub new_owner: UncheckedAccount<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"owner",
        ],
        bump
    )]
    pub owners: Account<'info, Owners>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct create_authority<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(init, space = 40, payer = owner, seeds = [b"owner"], bump)]
    pub owners: Account<'info, Owners>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Owners {
    pub owner: Pubkey,
}

#[error_code]
pub enum Errors {
    //8982
    #[msg("you are not authorized")]
    Unauthorized,
}