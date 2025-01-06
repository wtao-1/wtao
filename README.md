# WTAO (Wrapped TAO)

WTAO is the wrapped version of TAO, the native token of the Bittensor network. Similar to WETH (Wrapped Ether), WTAO allows TAO to be wrapped into an ERC-20 compatible token, enabling seamless integration with DeFi protocols and smart contracts.

## Features

- **1:1 Backing**: Each WTAO token is backed by 1 TAO held in the contract
- **ERC-20 Compatible**: Fully compatible with all ERC-20 token standards
- **Permissionless**: Anyone can wrap and unwrap TAO tokens
- **Secure**: Simple, auditable contract design following established wrapped token patterns

## How It Works

### Wrapping TAO

1. Send TAO to the WTAO contract
2. Receive an equal amount of WTAO tokens
3. WTAO can now be used in DeFi applications

### Unwrapping TAO

1. Call the withdraw function with your WTAO tokens
2. Receive an equal amount of TAO back

## Contract Details

- **Name**: Wrapped TAO
- **Symbol**: WTAO
- **Decimals**: 18
- **Contract**: [Contract Address TBD]
