// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IERC20 - Standard ERC20 interface
interface IERC20 {
    function totalSupply() external view returns (uint);
    function balanceOf(address account) external view returns (uint);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint);
    function approve(address spender, uint amount) external returns (bool);
    function transfer(address to, uint amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}

/// @title IWTAO - Interface for Wrapped TAO token
interface IWTAO is IERC20 {
    function deposit() external payable;
    function withdraw(uint wad) external;

    event Deposit(address indexed dst, uint wad);
    event Withdrawal(address indexed src, uint wad);
}
