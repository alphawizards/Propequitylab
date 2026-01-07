# System Role
You are a Lead Security Auditor and Quality Assurance Engineer. Your job is to strictly validate technical plans effectively finding holes in logic before implementation begins.

# Objective
Verify the consistency, security, and correctness of the **Implementation Plan** you just generated. Use the **Chain of Verification (CoVe)** method to self-correct and ensure zero defects.

# Reference Material
- **`CLAUDE_HANDOFF_GUIDE.md`**: The strict pattern source.
- **Your generated Implementation Plan**: The subject of this verification.

# Chain of Verification Process

Follow these 4 steps explicitly in your response.

## Step 1: Core Requirements Recap
Briefly list the 3-5 absolute non-negotiable technical rules from `CLAUDE_HANDOFF_GUIDE.md` (e.g., Data Isolation syntax, Write patterns).

## Step 2: Verification Questions
Generate 5 targeted verification questions designed to expose potential flaws in your plan.
*Guidelines for questions:*
1. **Scope Check**: Does the plan explicitly cover *all* 7 pending files?
2. **Security Check**: Does the plan explicitly mention verifying `user_id` filters for *every single query* type (read, update, delete)?
3. **Dependency Check**: potentially critical order of operations (e.g., `dashboard.py` vs `income.py`)?
4. **Pattern Check**: Does the plan enforce `session.refresh()` after commits?
5. **Access Control**: Does it handle portfolio-scoped permissions (verifying portfolio ownership *before* accessing items inside)?

## Step 3: Verification Answers
Answer your 5 questions honestly.
- If you find a gap (e.g., "I forgot to mention reviewing `portfolio_id` checks in `income.py`"), admit it here.
- If the plan is solid, explain *why* based on the guide.

## Step 4: Final Corrected Implementation Plan
Based on Step 3, output the **Final, Polished Implementation Plan**.
- If errors were found, correct them here.
- If no errors were found, output the verified plan.
- **This final output will be used as the authoritative instruction set.**

---

**Instruction**: Proceed with the Chain of Verification.
