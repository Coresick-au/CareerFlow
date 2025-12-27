---
description: Update onboarding content when new features are added to CareerFlow
---

# When to use this workflow

Run through this checklist whenever you add a new major feature to CareerFlow.

## Steps

1. **Review the Welcome Modal**
   - Open `src/components/WelcomeModal.tsx`
   - Does the new feature deserve mention in the "Built for Australians" section?
   - Should there be a new quick-start option for this feature?
   - Update the modal content if needed

2. **Review Empty States**
   - Check the affected page/component for empty states
   - Update empty state messaging to guide users to the new feature
   - Ensure CTAs are actionable and helpful

3. **Review Tooltips and Help Text**
   - Are there new concepts that need explanation? (like Loyalty Tax has `LoyaltyTaxTooltip`)
   - Add info icons with tooltips for new jargon or calculations
   - Keep explanations Australian-focused

4. **Consider "What's New" for returning users**
   - For significant features, consider a one-time notification
   - Can be shown via localStorage flag similar to `WELCOME_DISMISSED_KEY`

5. **Update this checklist if needed**
   - If the new feature introduces a pattern that should be documented, update this workflow

## Australian Context Reminders

When updating onboarding content, remember:
- Use financial year notation (FY2024-25)
- Reference ATO, Super, PAYG where relevant
- Use Australian spelling (organisation, customise, colour)
- Include Australian examples (BHP, Telstra, Woolworths, local councils)
- Default to 38 hours for full-time work
- Super guarantee rate changes yearly - update as needed
