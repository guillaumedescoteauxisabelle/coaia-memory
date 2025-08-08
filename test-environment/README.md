# COAIA Memory Test Environment

This test environment allows you to easily test the COAIA Memory system with Claude Code CLI.

## Setup Instructions

1. **Build the COAIA Memory system** (from parent directory):
   ```bash
   cd ..
   npm run build
   ```

2. **Enter the test environment**:
   ```bash
   cd test-environment
   ```

3. **Launch Claude Code CLI**:
   ```bash
   claude-code
   ```

4. **Test the system** - Try these natural language commands with Claude:
   - "Show me my active charts"
   - "Create a chart to learn Spanish in 4 months"
   - "Mark the guitar buying action as complete"
   - "Break down the guitar teacher step into more detail"

## Files in This Directory

- **`.mcp.json`** - MCP configuration linking to the COAIA Memory server
- **`CLAUDE.md`** - Instructions and guidelines for Claude when testing
- **`test-memory.jsonl`** - Sample structural tension chart data
- **`README.md`** - This usage guide

## Sample Data

The test environment includes a demo structural tension chart:
- **Desired Outcome**: Learn to play 5 songs on guitar
- **Current Reality**: Never played guitar before
- **Action Steps**: Buy guitar, find teacher, practice daily
- **Due Date**: November 1st, 2025

## Testing Scenarios

### Basic Chart Operations
```
You: "Show me my guitar learning progress"
Claude: [uses get_chart_progress tool]

You: "I bought a guitar yesterday"
Claude: [uses mark_action_complete tool]
```

### Telescoping (Advanced)
```
You: "Break down finding a guitar teacher into detailed steps"
Claude: [uses telescope_action_step tool]
```

### Creative Orientation
```
You: "I want to create a mobile app"
Claude: "What's your current reality regarding mobile app development?"
```

## Expected Behavior

Claude should:
- Use creative-oriented language ("What do you want to create?")
- Focus on desired outcomes, not problems
- Maintain structural tension awareness
- Guide proper chart creation process
- Track progress and completion naturally

## Troubleshooting

- If tools aren't available, check that the parent directory build succeeded
- If memory file errors occur, delete `test-memory.jsonl` to reset
- Check `.mcp.json` path matches your directory structure