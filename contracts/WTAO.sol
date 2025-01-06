// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title WTAO - Wrapped TAO Token Contract
/// @notice This contract allows users to wrap TAO tokens, similar to WETH
contract WTAO {
    // Basic token information
    string public constant name = "Wrapped TAO";
    string public constant symbol = "WTAO";
    uint8 public constant decimals = 18;

    // Events for tracking token operations
    event Approval(address indexed src, address indexed guy, uint wad);
    event Transfer(address indexed src, address indexed dst, uint wad);
    event Deposit(address indexed dst, uint wad);
    event Withdrawal(address indexed src, uint wad);

    // State variables for balances and allowances
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    /// @notice Allows direct TAO deposits through sending to contract
    receive() external payable {
        deposit();
    }

    /// @notice Deposit TAO and receive WTAO
    /// @dev Wraps TAO to WTAO 1:1
    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Withdraw TAO by burning WTAO
    /// @param wad Amount of WTAO to unwrap
    function withdraw(uint wad) public {
        require(balanceOf[msg.sender] >= wad, "Insufficient balance");
        balanceOf[msg.sender] -= wad;
        payable(msg.sender).transfer(wad);
        emit Withdrawal(msg.sender, wad);
    }

    /// @notice Get total supply of WTAO
    /// @return Total amount of TAO locked in contract
    function totalSupply() public view returns (uint) {
        return address(this).balance;
    }

    /// @notice Approve spender to transfer tokens
    /// @param guy Address to approve
    /// @param wad Amount of tokens to approve
    /// @return success Always returns true
    function approve(address guy, uint wad) public returns (bool) {
        allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
        return true;
    }

    /// @notice Transfer tokens to another address
    /// @param dst Destination address
    /// @param wad Amount to transfer
    /// @return success Always returns true
    function transfer(address dst, uint wad) public returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    /// @notice Transfer tokens from one address to another
    /// @param src Source address
    /// @param dst Destination address
    /// @param wad Amount to transfer
    /// @return success Always returns true
    /// @dev Includes allowance check when transferring from another account
    function transferFrom(
        address src,
        address dst,
        uint wad
    ) public returns (bool) {
        require(balanceOf[src] >= wad, "Insufficient balance");

        // Check allowance unless it's max value or sender is the source
        if (src != msg.sender && allowance[src][msg.sender] != type(uint).max) {
            require(
                allowance[src][msg.sender] >= wad,
                "Insufficient allowance"
            );
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        emit Transfer(src, dst, wad);

        return true;
    }
}
