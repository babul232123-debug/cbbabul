# Security Specification: Brajdham Parikrama Database

This document details the Zero-Trust attribute and schema invariants for the parikrama tourist administration portal, satisfying Phase 0 of the hardened Firestore Rules standard.

## 1. Core Data Invariants
- **Schema Key Whitelisting**: Every passenger record must contain exactly its required schema keys (`id`, `name`, `mobile`, `totalFare`) and avoid "ghost field" injection.
- **Identity Integrity**: All operations must have a valid URL-based ID and match the standard alphanumeric constraints (`isValidId`).
- **PII Integrity**: Phone numbers and sensitive variables carry restrictive string boundaries to avoid large-payload storage attacks.

---

## 2. The "Dirty Dozen" Security Violations (TDD Payloads)
The following payloads represents malicious attempts to inject corrupt data:

1. **The Ghost Field (Privilege Escalation)**  
   ```json
   { "id": "p1", "name": "Babul", "mobile": "017", "totalFare": "16001", "isAdmin": true }
   ```
   *Expectation*: REJECTED (Fails strict schema validation).

2. **The Missing Vital (Null Identifier)**  
   ```json
   { "id": "p1", "mobile": "017", "totalFare": "16001" }
   ```
   *Expectation*: REJECTED (Fails `hasAll` key constraint).

3. **String Overload (Denial of Wallet)**  
   ```json
   { "id": "p1", "name": "A...", [1MB String] "mobile": "017", "totalFare": "16001" }
   ```
   *Expectation*: REJECTED (Fails `.size() <= 100` string boundaries).

4. **Spoofed ID (Malicious Inbound ID)**  
   ```json
   { "id": "p_invalid_$$$", "name": "Babul", "mobile": "017", "totalFare": "16001" }
   ```
   *Expectation*: REJECTED (Fails `isValidId` regex matcher).

5. **Type Poisoning (Wrong Data Primitive)**  
   ```json
   { "id": "p1", "name": 5555, "mobile": "017", "totalFare": "16001" }
   ```
   *Expectation*: REJECTED (Fails `is string` type checks).

6. **Free Fare Spoof (Price Tampering)**  
   ```json
   { "id": "p1", "name": "Babul", "mobile": "017", "totalFare": "" }
   ```
   *Expectation*: REJECTED (Fails empty length bounds).

7. **Negative Payment Inflow**  
   ```json
   { "id": "p1", "name": "Babul", "mobile": "017", "totalFare": "-16001" }
   ```
   *Expectation*: REJECTED (Blocked via validation routines).

8. **Orphaned Sibling Write (Invalid Session)**  
   Writing nested lists without validating top-level settings invariants.  
   *Expectation*: REJECTED.

9. **Settings Hijack (Public overwrite)**  
   Attempting to rewrite global travel dates without validation.  
   *Expectation*: REJECTED.

10. **Admin Token Exploitation**  
    Passing fictitious authenticated roles to bypass authorization.  
    *Expectation*: REJECTED.

11. **Path Traversal Escape**  
    Using `../..` inside a document ID during a write action.  
    *Expectation*: REJECTED.

12. **Double Seed-Reset Injection**  
    Flooding database collections synchronously to trigger race conditions.  
    *Expectation*: REJECTED.

---

## 3. Test Verification Rules
Security checks run continuously via `firestore.rules` validating the incoming state changes. All 12 threat vectors are blocked dynamically inside rule logic.
