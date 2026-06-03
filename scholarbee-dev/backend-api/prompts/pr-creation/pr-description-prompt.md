# PR Description Prompt Template

Use this prompt when creating PR descriptions to ensure they are stakeholder-focused and clear.

## Prompt

```
Create a PR description for my changes against the develop branch. Follow these guidelines:

**Primary Focus (60% of content):**
- Clearly explain what API consumers (frontend, mobile, external clients) need to know
- Highlight any changes to API request/response structures
- List all breaking changes that affect consumers
- Specify migration steps if needed
- Use simple, non-technical language where possible

**Secondary Focus (30% of content):**
- Mention major architectural changes or shifts
- Note significant refactoring or code organization changes
- Highlight performance improvements or optimizations
- Keep technical details concise and high-level

**Structure:**
1. **What Changed** - Brief 2-3 sentence summary
2. **Impact for Frontend/API Consumers** - Bullet points of what they need to know
3. **Breaking Changes** - Explicitly list any breaking changes
4. **Implementation Notes** (optional) - Only if there are significant architectural shifts
5. **Testing** - Brief note on what was tested

**Tone:**
- Professional but accessible
- Clear and direct
- Avoid jargon unless necessary
- Focus on "what" and "why" more than "how"

**Length:**
- Keep it concise (aim for 20-50 lines)
- Don't be verbose
- Prioritize actionable information

Analyze my staged changes and create the PR description accordingly.
```

## Usage Instructions

1. Stage your changes: `git add .`
2. Review what's changed: `git diff --cached` or `git status`
3. Use the prompt above with your AI assistant
4. The assistant will analyze your changes and create a stakeholder-focused PR description

## Example Output Structure

```markdown
### What Changed
Brief summary of the changes...

### Impact for Frontend/API Consumers
- Change 1 that affects consumers
- Change 2 that affects consumers
- Migration guidance if needed

### Breaking Changes
- Breaking change 1
- Breaking change 2

### Implementation Notes (if significant)
- Major architectural shift
- Performance improvement

### Testing
- What was tested
```

## Key Principles

1. **Consumer First**: Always start with what frontend/API consumers need to know
2. **Breaking Changes**: Always explicitly call out breaking changes
3. **Migration Path**: Provide clear migration steps when needed
4. **Concise**: Don't overwhelm with technical details
5. **Actionable**: Tell stakeholders what they need to do

