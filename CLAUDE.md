# COAIA Memory - Creative-Oriented AI Assistant Memory System

> MCP server implementing structural tension charts and advancing pattern support based on Robert Fritz's creative methodology

## What is COAIA Memory?

COAIA Memory extends traditional knowledge graphs with **structural tension charts** - a powerful framework for organizing creative processes around desired outcomes rather than problem-solving. Based on Robert Fritz's structural tension methodology, it helps AI assistants maintain creative orientation and support advancing patterns.

## Key Features

### 🎯 Structural Tension Charts
- **Desired Outcomes**: Clear, specific results you want to create
- **Current Reality**: Honest assessment of where you are now  
- **Action Steps**: Strategic actions that bridge the gap
- **Due Dates**: Time organization that creates momentum

### 🔭 Telescoping Support
- Break down complex action steps into detailed sub-charts
- Proper due date inheritance from parent steps
- Hierarchical navigation between overview and details
- Maintains structural tension at every level

### 📈 Advancing Pattern Tracking
- Completed actions automatically flow into current reality
- Progress monitoring across multiple charts
- Success builds momentum for continued advancement
- Prevents oscillating patterns through structural awareness

### 🗣️ Natural Language Ready
- Conversational patterns documented for intuitive interaction
- Creative-oriented language (focus on creation vs problem-solving)
- AI assistants can guide users through structural tension exercises

## Installation & Usage

### As NPX Package
```bash
npx coaia-memory --memory-path ./my-charts.jsonl
```

### In Claude Desktop Config
```json
{
  "mcpServers": {
    "coaia-memory": {
      "command": "npx",
      "args": ["-y", "coaia-memory", "--memory-path", "/path/to/your/charts.jsonl"],
      "autoapprove": [
        "create_structural_tension_chart",
        "telescope_action_step", 
        "mark_action_complete",
        "get_chart_progress",
        "list_active_charts",
        "create_entities",
        "create_relations",
        "add_observations"
      ]
    }
  }
}
```

## Core Tools

### Chart Management
- `create_structural_tension_chart` - Create new chart with outcome, reality, and action steps
- `telescope_action_step` - Break down action steps into detailed sub-charts
- `mark_action_complete` - Complete actions and update current reality
- `get_chart_progress` - Monitor chart advancement
- `list_active_charts` - Overview of all active charts

### Traditional Knowledge Graph
- `create_entities` - Add new entities (people, concepts, events)
- `create_relations` - Connect entities with relationships
- `add_observations` - Record new information about entities
- Plus full CRUD operations for entities, relations, and observations

## Example Usage

### Creating a Chart
```javascript
// Natural language: "I want to learn Python web development in 6 weeks"
{
  "desiredOutcome": "Learn Python web development", 
  "currentReality": "I know basic Python but no web frameworks",
  "dueDate": "2025-09-15T00:00:00Z",
  "actionSteps": [
    "Complete Django tutorial",
    "Build practice project", 
    "Deploy something live"
  ]
}
```

### Telescoping Detail
```javascript
// Natural language: "Break down the Django tutorial step"
{
  "actionStepName": "chart_123_action_1",
  "newCurrentReality": "Never used Django, familiar with Python basics"
}
```

### Tracking Progress
```javascript
// Natural language: "I finished the Django tutorial"
{
  "actionStepName": "chart_123_action_1"
}
```

## Creative Orientation Principles

### Focus on Creation, Not Problem-Solving
- **Use**: "I want to create...", "My desired outcome is..."
- **Avoid**: "I need to fix...", "The problem is...", "I want to stop..."

### Structural Tension Awareness  
- Always pair desired outcomes with current reality
- Honest assessment creates productive tension
- Action steps bridge the gap, not eliminate problems

### Advancing Patterns
- Success builds on success
- Completed actions become part of current reality
- Momentum creates natural progression toward goals

## Architecture

### Enhanced Entity Types
- `structural_tension_chart` - Container for chart components
- `desired_outcome` - What you want to create
- `current_reality` - Where you are now  
- `action_step` - Strategic actions with due dates

### Creative Relations
- `creates_tension_with` - Between current reality and desired outcome
- `advances_toward` - Action steps advancing toward outcomes
- `telescopes_into` - Hierarchical chart relationships
- `flows_into` - Completed actions updating reality

### Metadata Support
- Due dates and completion tracking
- Chart hierarchy and telescoping relationships
- Creative phases (germination, assimilation, completion)
- Timestamps and progress metrics

## Development

### Build & Test
```bash
npm install
npm run build
node test-coaia.js
```

### Next Milestone
**Guided Chart Creation**: Transform from passive storage to active coaching system that helps users create meaningful structural tension charts with proper creative orientation validation.

## Credits

- **Author**: J.Guillaume D.-Isabelle <jgi@jgwill.com> (https://github.com/jgwill)
- **Methodology**: Robert Fritz - Structural Tension (https://robertfritz.com)  
- **Foundation**: Shane Holloman - Original MCP Knowledge Graph
- **License**: MIT

## Philosophy

COAIA Memory embodies the principle that **structure determines behavior**. By organizing memory around structural tension rather than problem-solving patterns, it naturally supports creative advancement and helps users build the life they want to create.

The system recognizes that the difference between oscillating and advancing patterns lies in the underlying structure - and provides that structure through properly formed structural tension charts.