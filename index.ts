#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import { isAbsolute } from 'path';

// Parse args and handle paths safely
const argv = minimist(process.argv.slice(2));

// Handle help command
if (argv.help || argv.h) {
  console.log(`
🧠 COAIA Memory - Creative-Oriented AI Assistant Memory System v2.1.0
   Based on Robert Fritz's Structural Tension methodology

DESCRIPTION:
   MCP server that extends knowledge graphs with structural tension charts for 
   creative-oriented memory management. Supports advancing patterns, telescoping
   charts, and natural language interaction for AI assistants.

USAGE:
   coaia-memory [OPTIONS]
   npx coaia-memory [OPTIONS]

OPTIONS:
   --memory-path PATH    Custom path for memory storage (default: ./memory.jsonl)
   --help, -h           Show this help message

CORE FEATURES:
   
   📊 Structural Tension Charts
   • Create charts with desired outcomes, current reality, and action steps
   • Automatic due date distribution for strategic timing
   • Progress tracking and completion monitoring
   
   🔭 Telescoping Support  
   • Break down action steps into detailed sub-charts
   • Proper due date inheritance from parent steps
   • Navigate between overview and details seamlessly
   
   📈 Advancing Patterns
   • Completed actions flow into current reality automatically  
   • Success builds momentum for continued advancement
   • Prevents oscillating patterns through structural awareness

MCP TOOLS AVAILABLE:
   
   Chart Management (Common Workflow):
   • list_active_charts            - START HERE: See all charts and their progress
   • add_action_step               - Add strategic actions to existing charts  
   • telescope_action_step         - Break down action steps into detailed sub-charts
   • update_action_progress        - Track progress without completing actions
   • mark_action_complete          - Complete actions & update reality
   • update_current_reality        - Add observations directly to current reality
   • create_structural_tension_chart - Create new chart with outcome & reality
   
   Chart Analysis (Advanced):
   • get_chart_progress            - Detailed progress (redundant after list_active_charts)
   • open_nodes                    - Inspect specific chart components by exact name
   • read_graph                    - Dump all data (rarely needed)
   
   Knowledge Graph (Traditional):
   • create_entities               - Add entities (people, concepts, events)
   • create_relations              - Connect entities with relationships  
   • add_observations              - Record information about entities
   • search_nodes                  - Search across all stored information
   • read_graph                    - Export complete graph structure

EXAMPLE USAGE:

   # Start with custom memory path
   coaia-memory --memory-path /path/to/my-charts.jsonl
   
   # Use in Claude Desktop (add to claude_desktop_config.json):
   {
     "mcpServers": {
       "coaia-memory": {
         "command": "npx", 
         "args": ["-y", "coaia-memory", "--memory-path", "./charts.jsonl"]
       }
     }
   }

NATURAL LANGUAGE PATTERNS:

   Creating Charts:
   "I want to create a mobile app in 3 months"
   "My desired outcome is to establish a morning routine"
   
   Progress Tracking:
   "I completed the research phase yesterday"  
   "Show me progress on my Python learning goal"
   
   Telescoping:
   "Break down the Django tutorial step further"
   "I need more detail on the deployment action"

CREATIVE ORIENTATION PRINCIPLES:

   ✅ Focus on Creation (not problem-solving):
      • "I want to create..." vs "I need to fix..."
      • "My desired outcome..." vs "The problem is..."
   
   ✅ Structural Tension Awareness:
      • Always pair desired outcomes with current reality
      • Honest assessment creates productive tension
      • Action steps are strategic secondary action we choose todo to achive the primary goal
   
   ✅ Advancing Patterns:
      • Success builds on success
      • Completed actions become part of current reality
      • Momentum creates natural progression toward goals

PHILOSOPHY:
   COAIA Memory recognizes that structure determines behavior. By organizing
   memory around structural tension rather than problem-solving patterns, it
   naturally forms a structure that advances and helps build, not just the life you want, but the technologies to supports it's manifestation (hopefully!).

CREDITS:
   • Author: J.Guillaume D.-Isabelle <jgi@jgwill.com>
   • Methodology: Robert Fritz - https://robertfritz.com
   • Foundation: Shane Holloman (original mcp-knowledge-graph)
   • License: MIT

For more information, see: CLAUDE.md in the package directory
`);
  process.exit(0);
}

let memoryPath = argv['memory-path'];

// If a custom path is provided, ensure it's absolute
if (memoryPath && !isAbsolute(memoryPath)) {
    memoryPath = path.resolve(process.cwd(), memoryPath);
}

// Define the path to the JSONL file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Use the custom path or default to the installation directory
const MEMORY_FILE_PATH = memoryPath || path.join(__dirname, 'memory.jsonl');

// We are storing our memory using entities, relations, and observations in a graph structure
// Extended for Creative Orientation AI Assistant (COAIA) with structural tension support
interface Entity {
  name: string;
  entityType: string;
  observations: string[];
  metadata?: {
    dueDate?: string;
    chartId?: string;
    phase?: 'germination' | 'assimilation' | 'completion';
    completionStatus?: boolean;
    parentChart?: string;
    parentActionStep?: string;
    level?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

interface Relation {
  from: string;
  to: string;
  relationType: string;
  metadata?: {
    createdAt?: string;
    strength?: number;
  };
}

interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

// The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
class KnowledgeGraphManager {
  private async loadGraph(): Promise<KnowledgeGraph> {
    try {
      const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
      const lines = data.split("\n").filter(line => line.trim() !== "");
      return lines.reduce((graph: KnowledgeGraph, line) => {
        const item = JSON.parse(line);
        if (item.type === "entity") graph.entities.push(item as Entity);
        if (item.type === "relation") graph.relations.push(item as Relation);
        return graph;
      }, { entities: [], relations: [] });
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT") {
        return { entities: [], relations: [] };
      }
      throw error;
    }
  }

  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    const lines = [
      ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
      ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r })),
    ];
    await fs.writeFile(MEMORY_FILE_PATH, lines.join("\n"));
  }

  async createEntities(entities: Entity[]): Promise<Entity[]> {
    const graph = await this.loadGraph();
    const newEntities = entities.filter(e => !graph.entities.some(existingEntity => existingEntity.name === e.name));
    graph.entities.push(...newEntities);
    await this.saveGraph(graph);
    return newEntities;
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    const graph = await this.loadGraph();
    const newRelations = relations.filter(r => !graph.relations.some(existingRelation =>
      existingRelation.from === r.from &&
      existingRelation.to === r.to &&
      existingRelation.relationType === r.relationType
    ));
    graph.relations.push(...newRelations);
    await this.saveGraph(graph);
    return newRelations;
  }

  async addObservations(observations: { entityName: string; contents: string[] }[]): Promise<{ entityName: string; addedObservations: string[] }[]> {
    const graph = await this.loadGraph();
    const results = observations.map(o => {
      const entity = graph.entities.find(e => e.name === o.entityName);
      if (!entity) {
        throw new Error(`Entity with name ${o.entityName} not found`);
      }
      const newObservations = o.contents.filter(content => !entity.observations.includes(content));
      entity.observations.push(...newObservations);
      return { entityName: o.entityName, addedObservations: newObservations };
    });
    await this.saveGraph(graph);
    return results;
  }

  async deleteEntities(entityNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
    graph.relations = graph.relations.filter(r => !entityNames.includes(r.from) && !entityNames.includes(r.to));
    await this.saveGraph(graph);
  }

  async deleteObservations(deletions: { entityName: string; observations: string[] }[]): Promise<void> {
    const graph = await this.loadGraph();
    deletions.forEach(d => {
      const entity = graph.entities.find(e => e.name === d.entityName);
      if (entity) {
        entity.observations = entity.observations.filter(o => !d.observations.includes(o));
      }
    });
    await this.saveGraph(graph);
  }

  async deleteRelations(relations: Relation[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.relations = graph.relations.filter(r => !relations.some(delRelation =>
      r.from === delRelation.from &&
      r.to === delRelation.to &&
      r.relationType === delRelation.relationType
    ));
    await this.saveGraph(graph);
  }

  async readGraph(): Promise<KnowledgeGraph> {
    return this.loadGraph();
  }

  // Very basic search function
  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.entityType.toLowerCase().includes(query.toLowerCase()) ||
      e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
    );

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter(e => names.includes(e.name));

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  // COAIA-specific methods for structural tension charts and creative processes

  async createStructuralTensionChart(
    desiredOutcome: string,
    currentReality: string,
    dueDate: string,
    actionSteps?: string[]
  ): Promise<{ chartId: string; entities: Entity[]; relations: Relation[] }> {
    const chartId = `chart_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Create chart, desired outcome, and current reality entities
    const entities: Entity[] = [
      {
        name: `${chartId}_chart`,
        entityType: 'structural_tension_chart',
        observations: [`Chart created on ${timestamp}`],
        metadata: {
          chartId,
          dueDate,
          level: 0,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      },
      {
        name: `${chartId}_desired_outcome`,
        entityType: 'desired_outcome',
        observations: [desiredOutcome],
        metadata: {
          chartId,
          dueDate,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      },
      {
        name: `${chartId}_current_reality`,
        entityType: 'current_reality',
        observations: [currentReality],
        metadata: {
          chartId,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    ];

    // Add action steps if provided
    if (actionSteps && actionSteps.length > 0) {
      const stepDueDates = this.distributeActionStepDates(new Date(), new Date(dueDate), actionSteps.length);
      
      actionSteps.forEach((step, index) => {
        entities.push({
          name: `${chartId}_action_${index + 1}`,
          entityType: 'action_step',
          observations: [step],
          metadata: {
            chartId,
            dueDate: stepDueDates[index].toISOString(),
            completionStatus: false,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        });
      });
    }

    // Create relations
    const relations: Relation[] = [
      {
        from: `${chartId}_chart`,
        to: `${chartId}_desired_outcome`,
        relationType: 'contains',
        metadata: { createdAt: timestamp }
      },
      {
        from: `${chartId}_chart`,
        to: `${chartId}_current_reality`,
        relationType: 'contains',
        metadata: { createdAt: timestamp }
      },
      {
        from: `${chartId}_current_reality`,
        to: `${chartId}_desired_outcome`,
        relationType: 'creates_tension_with',
        metadata: { createdAt: timestamp }
      }
    ];

    // Add action step relations
    if (actionSteps && actionSteps.length > 0) {
      actionSteps.forEach((_, index) => {
        const actionName = `${chartId}_action_${index + 1}`;
        relations.push(
          {
            from: `${chartId}_chart`,
            to: actionName,
            relationType: 'contains',
            metadata: { createdAt: timestamp }
          },
          {
            from: actionName,
            to: `${chartId}_desired_outcome`,
            relationType: 'advances_toward',
            metadata: { createdAt: timestamp }
          }
        );
      });
    }

    // Save to graph
    await this.createEntities(entities);
    await this.createRelations(relations);

    return { chartId, entities, relations };
  }

  async telescopeActionStep(
    actionStepName: string,
    newCurrentReality: string,
    initialActionSteps?: string[]
  ): Promise<{ chartId: string; parentChart: string }> {
    const graph = await this.loadGraph();
    const actionStep = graph.entities.find(e => e.name === actionStepName && e.entityType === 'action_step');
    
    if (!actionStep || !actionStep.metadata?.chartId) {
      throw new Error(`Action step ${actionStepName} not found or not properly configured`);
    }

    const parentChartId = actionStep.metadata.chartId;
    const inheritedDueDate = actionStep.metadata.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const desiredOutcome = actionStep.observations[0]; // Use the action step description as the new desired outcome

    const result = await this.createStructuralTensionChart(
      desiredOutcome,
      newCurrentReality,
      inheritedDueDate,
      initialActionSteps
    );

    // Update the new chart's metadata to reflect telescoping relationship
    const newChart = await this.loadGraph();
    const chartEntity = newChart.entities.find(e => e.name === `${result.chartId}_chart`);
    if (chartEntity && chartEntity.metadata) {
      chartEntity.metadata.parentChart = parentChartId;
      chartEntity.metadata.parentActionStep = actionStepName;
      chartEntity.metadata.level = (actionStep.metadata.level || 0) + 1;
      chartEntity.metadata.updatedAt = new Date().toISOString();
    }

    await this.saveGraph(newChart);

    return { chartId: result.chartId, parentChart: parentChartId };
  }

  async markActionStepComplete(actionStepName: string): Promise<void> {
    const graph = await this.loadGraph();
    const actionStep = graph.entities.find(e => e.name === actionStepName && e.entityType === 'action_step');
    
    if (!actionStep) {
      throw new Error(`Action step ${actionStepName} not found`);
    }

    // Mark as complete
    if (actionStep.metadata) {
      actionStep.metadata.completionStatus = true;
      actionStep.metadata.updatedAt = new Date().toISOString();
    }

    // Structural tension principle: completed action steps flow into current reality,
    // changing the structural dynamic and advancing the system toward equilibrium
    if (actionStep.metadata?.chartId) {
      const currentReality = graph.entities.find(e => 
        e.name === `${actionStep.metadata!.chartId}_current_reality` && 
        e.entityType === 'current_reality'
      );
      
      if (currentReality) {
        // The completed action step becomes part of current reality, 
        // creating new structural tension for continued advancement
        currentReality.observations.push(`Completed: ${actionStep.observations[0]}`);
        if (currentReality.metadata) {
          currentReality.metadata.updatedAt = new Date().toISOString();
        }
      }
    }

    await this.saveGraph(graph);
  }

  async getChartProgress(chartId: string): Promise<{
    chartId: string;
    progress: number;
    completedActions: number;
    totalActions: number;
    nextAction?: string;
    dueDate?: string;
  }> {
    const graph = await this.loadGraph();
    const actionSteps = graph.entities.filter(e => 
      e.entityType === 'action_step' && 
      e.metadata?.chartId === chartId
    );

    const completedActions = actionSteps.filter(e => e.metadata?.completionStatus === true).length;
    const totalActions = actionSteps.length;
    const progress = totalActions > 0 ? completedActions / totalActions : 0;

    // Find next incomplete action step with earliest due date
    const incompleteActions = actionSteps
      .filter(e => e.metadata?.completionStatus !== true)
      .sort((a, b) => {
        const dateA = new Date(a.metadata?.dueDate || '').getTime();
        const dateB = new Date(b.metadata?.dueDate || '').getTime();
        return dateA - dateB;
      });

    const chart = graph.entities.find(e => e.name === `${chartId}_chart`);

    return {
      chartId,
      progress,
      completedActions,
      totalActions,
      nextAction: incompleteActions[0]?.name,
      dueDate: chart?.metadata?.dueDate
    };
  }

  private distributeActionStepDates(startDate: Date, endDate: Date, stepCount: number): Date[] {
    const totalTime = endDate.getTime() - startDate.getTime();
    const stepInterval = totalTime / (stepCount + 1); // +1 to leave space before final due date
    
    const dates: Date[] = [];
    for (let i = 1; i <= stepCount; i++) {
      dates.push(new Date(startDate.getTime() + (stepInterval * i)));
    }
    
    return dates;
  }

  async listActiveCharts(): Promise<Array<{
    chartId: string;
    desiredOutcome: string;
    dueDate?: string;
    progress: number;
    completedActions: number;
    totalActions: number;
    level: number;
    parentChart?: string;
  }>> {
    const graph = await this.loadGraph();
    const charts = graph.entities.filter(e => e.entityType === 'structural_tension_chart');
    
    const chartSummaries = await Promise.all(
      charts.map(async (chart) => {
        const chartId = chart.metadata?.chartId || chart.name.replace('_chart', '');
        const progress = await this.getChartProgress(chartId);
        
        // Get desired outcome
        const desiredOutcome = graph.entities.find(e => 
          e.name === `${chartId}_desired_outcome` && e.entityType === 'desired_outcome'
        );
        
        return {
          chartId,
          desiredOutcome: desiredOutcome?.observations[0] || 'Unknown outcome',
          dueDate: chart.metadata?.dueDate,
          progress: progress.progress,
          completedActions: progress.completedActions,
          totalActions: progress.totalActions,
          level: chart.metadata?.level || 0,
          parentChart: chart.metadata?.parentChart
        };
      })
    );

    return chartSummaries.sort((a, b) => {
      // Sort by level first (master charts first), then by due date
      if (a.level !== b.level) return a.level - b.level;
      
      const dateA = new Date(a.dueDate || '').getTime();
      const dateB = new Date(b.dueDate || '').getTime();
      return dateA - dateB;
    });
  }

  async updateActionProgress(
    actionStepName: string, 
    progressObservation: string,
    updateCurrentReality?: boolean
  ): Promise<void> {
    const graph = await this.loadGraph();
    const actionStep = graph.entities.find(e => e.name === actionStepName && e.entityType === 'action_step');
    
    if (!actionStep) {
      throw new Error(`Action step ${actionStepName} not found`);
    }

    // Add progress observation to action step
    actionStep.observations.push(progressObservation);
    if (actionStep.metadata) {
      actionStep.metadata.updatedAt = new Date().toISOString();
    }

    // Optionally update current reality with progress
    if (updateCurrentReality && actionStep.metadata?.chartId) {
      const currentReality = graph.entities.find(e => 
        e.name === `${actionStep.metadata!.chartId}_current_reality` && 
        e.entityType === 'current_reality'
      );
      
      if (currentReality) {
        // Progress observations flow into current reality, changing the structural dynamic
        currentReality.observations.push(`Progress on ${actionStep.observations[0]}: ${progressObservation}`);
        if (currentReality.metadata) {
          currentReality.metadata.updatedAt = new Date().toISOString();
        }
      }
    }

    await this.saveGraph(graph);
  }

  async updateCurrentReality(chartId: string, newObservations: string[]): Promise<void> {
    const graph = await this.loadGraph();
    const currentReality = graph.entities.find(e => 
      e.name === `${chartId}_current_reality` && 
      e.entityType === 'current_reality'
    );
    
    if (!currentReality) {
      throw new Error(`Chart ${chartId} not found or missing current reality`);
    }

    // Add new observations to current reality
    const uniqueObservations = newObservations.filter(obs => !currentReality.observations.includes(obs));
    currentReality.observations.push(...uniqueObservations);
    
    if (currentReality.metadata) {
      currentReality.metadata.updatedAt = new Date().toISOString();
    }

    await this.saveGraph(graph);
  }

  async addActionStep(
    parentChartId: string,
    actionStepTitle: string,
    dueDate?: string,
    currentReality?: string
  ): Promise<{ chartId: string; actionStepName: string }> {
    const graph = await this.loadGraph();
    const parentChart = graph.entities.find(e => 
      e.entityType === 'structural_tension_chart' && e.metadata?.chartId === parentChartId
    );
    
    if (!parentChart) {
      throw new Error(`Parent chart ${parentChartId} not found`);
    }

    // Get parent chart's due date for auto-distribution
    const parentDueDate = parentChart.metadata?.dueDate;
    if (!parentDueDate) {
      throw new Error(`Parent chart ${parentChartId} has no due date`);
    }

    // Calculate due date for action step if not provided
    let actionStepDueDate = dueDate;
    if (!actionStepDueDate) {
      // Distribute between now and parent due date (simple midpoint for now)
      const now = new Date();
      const parentEnd = new Date(parentDueDate);
      const midpoint = new Date(now.getTime() + (parentEnd.getTime() - now.getTime()) / 2);
      actionStepDueDate = midpoint.toISOString();
    }

    // Set default current reality if not provided
    const actionCurrentReality = currentReality || `Ready to begin: ${actionStepTitle}`;

    // Create telescoped structural tension chart
    const telescopedChart = await this.createStructuralTensionChart(
      actionStepTitle,
      actionCurrentReality, 
      actionStepDueDate
    );

    // Update the telescoped chart's metadata to show parent relationship
    const updatedGraph = await this.loadGraph();
    const telescopedChartEntity = updatedGraph.entities.find(e => e.name === `${telescopedChart.chartId}_chart`);
    if (telescopedChartEntity && telescopedChartEntity.metadata) {
      telescopedChartEntity.metadata.parentChart = parentChartId;
      telescopedChartEntity.metadata.level = (parentChart.metadata?.level || 0) + 1;
      telescopedChartEntity.metadata.updatedAt = new Date().toISOString();
    }

    // Create relationship: telescoped chart advances toward parent's desired outcome
    const parentDesiredOutcome = updatedGraph.entities.find(e => 
      e.name === `${parentChartId}_desired_outcome` && e.entityType === 'desired_outcome'
    );

    if (parentDesiredOutcome) {
      const timestamp = new Date().toISOString();
      await this.createRelations([{
        from: `${telescopedChart.chartId}_desired_outcome`,
        to: parentDesiredOutcome.name,
        relationType: 'advances_toward',
        metadata: { createdAt: timestamp }
      }]);
    }

    await this.saveGraph(updatedGraph);

    return { 
      chartId: telescopedChart.chartId, 
      actionStepName: `${telescopedChart.chartId}_desired_outcome` 
    };
  }

  async removeActionStep(parentChartId: string, actionStepName: string): Promise<void> {
    const graph = await this.loadGraph();
    
    // Find the action step (which is actually a telescoped chart's desired outcome)
    const actionStepEntity = graph.entities.find(e => e.name === actionStepName);
    if (!actionStepEntity || !actionStepEntity.metadata?.chartId) {
      throw new Error(`Action step ${actionStepName} not found`);
    }

    const telescopedChartId = actionStepEntity.metadata.chartId;
    
    // Verify it belongs to the parent chart
    const telescopedChart = graph.entities.find(e => 
      e.entityType === 'structural_tension_chart' && 
      e.metadata?.chartId === telescopedChartId &&
      e.metadata?.parentChart === parentChartId
    );
    
    if (!telescopedChart) {
      throw new Error(`Action step ${actionStepName} does not belong to chart ${parentChartId}`);
    }

    // Remove all entities belonging to the telescoped chart
    const entitiesToRemove = graph.entities
      .filter(e => e.metadata?.chartId === telescopedChartId)
      .map(e => e.name);

    await this.deleteEntities(entitiesToRemove);
  }
}

const knowledgeGraphManager = new KnowledgeGraphManager();


// The server instance and tools exposed to AI models
const server = new Server({
  name: "coaia-memory",
  version: "2.1.0",
},    {
    capabilities: {
      tools: {},
    },
  },);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_entities",
        description: "Create multiple new entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "The name of the entity" },
                  entityType: { type: "string", description: "The type of the entity" },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents associated with the entity"
                  },
                },
                required: ["name", "entityType", "observations"],
              },
            },
          },
          required: ["entities"],
        },
      },
      {
        name: "create_relations",
        description: "Create multiple new relations between entities in the knowledge graph. Relations should be in active voice",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "add_observations",
        description: "Add new observations to existing entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            observations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity to add the observations to" },
                  contents: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents to add"
                  },
                },
                required: ["entityName", "contents"],
              },
            },
          },
          required: ["observations"],
        },
      },
      {
        name: "delete_entities",
        description: "Delete multiple entities and their associated relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entityNames: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to delete"
            },
          },
          required: ["entityNames"],
        },
      },
      {
        name: "delete_observations",
        description: "Delete specific observations from entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            deletions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity containing the observations" },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observations to delete"
                  },
                },
                required: ["entityName", "observations"],
              },
            },
          },
          required: ["deletions"],
        },
      },
      {
        name: "delete_relations",
        description: "Delete multiple relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
              description: "An array of relations to delete"
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "read_graph",
        description: "RARELY USED: Dumps entire knowledge graph (all entities and relations). Only use for debugging or when you need to see ALL data. For chart work, use list_active_charts instead.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_nodes",
        description: "Search for nodes in the knowledge graph based on a query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query to match against entity names, types, and observation content" },
          },
          required: ["query"],
        },
      },
      {
        name: "open_nodes",
        description: "ADVANCED: Open specific entity nodes by exact name (e.g. 'chart_123_current_reality'). Only use if you need to inspect specific chart components. NOT for general chart viewing - use list_active_charts instead.",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "An array of exact entity names to retrieve (e.g. 'chart_123_desired_outcome')",
            },
          },
          required: ["names"],
        },
      },
      {
        name: "create_structural_tension_chart",
        description: "Create a new structural tension chart with desired outcome, current reality, and optional action steps",
        inputSchema: {
          type: "object",
          properties: {
            desiredOutcome: { type: "string", description: "What you want to create or achieve" },
            currentReality: { type: "string", description: "Your current situation in relation to the desired outcome" },
            dueDate: { type: "string", description: "When you want to achieve this outcome (ISO date string)" },
            actionSteps: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of action steps needed to achieve the outcome",
              optional: true
            }
          },
          required: ["desiredOutcome", "currentReality", "dueDate"]
        }
      },
      {
        name: "telescope_action_step",
        description: "Break down an action step into a detailed structural tension chart with optional initial action steps",
        inputSchema: {
          type: "object",
          properties: {
            actionStepName: { type: "string", description: "Name of the action step to telescope" },
            newCurrentReality: { type: "string", description: "Current reality specific to this action step" },
            initialActionSteps: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of initial action steps for the telescoped chart",
              optional: true
            }
          },
          required: ["actionStepName", "newCurrentReality"]
        }
      },
      {
        name: "mark_action_complete",
        description: "Mark an action step as completed and update current reality",
        inputSchema: {
          type: "object",
          properties: {
            actionStepName: { type: "string", description: "Name of the completed action step" }
          },
          required: ["actionStepName"]
        }
      },
      {
        name: "get_chart_progress",
        description: "Get detailed progress for a specific chart (redundant if you just used list_active_charts which shows progress). Only use if you need the nextAction details.",
        inputSchema: {
          type: "object",
          properties: {
            chartId: { type: "string", description: "ID of the chart to check progress for" }
          },
          required: ["chartId"]
        }
      },
      {
        name: "list_active_charts",
        description: "List all active structural tension charts with their progress. Use this FIRST to see all charts and their IDs. This shows chart overview with progress - you don't need other tools after this for basic chart information.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "update_action_progress",
        description: "Update progress on an action step without marking it complete, optionally updating current reality",
        inputSchema: {
          type: "object",
          properties: {
            actionStepName: { type: "string", description: "Name of the action step to update progress for" },
            progressObservation: { type: "string", description: "Description of progress made on this action step" },
            updateCurrentReality: { 
              type: "boolean", 
              description: "Whether to also add this progress to current reality (optional, defaults to false)",
              optional: true
            }
          },
          required: ["actionStepName", "progressObservation"]
        }
      },
      {
        name: "update_current_reality", 
        description: "Add new observations directly to current reality of a structural tension chart",
        inputSchema: {
          type: "object",
          properties: {
            chartId: { type: "string", description: "ID of the chart to update current reality for" },
            newObservations: {
              type: "array",
              items: { type: "string" },
              description: "Array of new observations to add to current reality"
            }
          },
          required: ["chartId", "newObservations"]
        }
      },
      {
        name: "add_action_step",
        description: "Add a strategic action step to an existing structural tension chart (creates telescoped chart)",
        inputSchema: {
          type: "object", 
          properties: {
            parentChartId: { type: "string", description: "ID of the parent chart to add the action step to" },
            actionStepTitle: { type: "string", description: "Title of the action step (becomes desired outcome of telescoped chart)" },
            dueDate: { 
              type: "string", 
              description: "Optional due date for the action step (ISO string). If not provided, auto-distributed between now and parent due date",
              optional: true
            },
            currentReality: {
              type: "string",
              description: "Optional current reality specific to this action step. If not provided, defaults to 'Ready to begin: [title]'",
              optional: true
            }
          },
          required: ["parentChartId", "actionStepTitle"]
        }
      },
      {
        name: "remove_action_step", 
        description: "Remove an action step from a structural tension chart (deletes telescoped chart)",
        inputSchema: {
          type: "object",
          properties: {
            parentChartId: { type: "string", description: "ID of the parent chart containing the action step" },
            actionStepName: { type: "string", description: "Name of the action step to remove (telescoped chart's desired outcome name)" }
          },
          required: ["parentChartId", "actionStepName"]
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  switch (name) {
    case "create_entities":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createEntities(args.entities as Entity[]), null, 2) }] };
    case "create_relations":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createRelations(args.relations as Relation[]), null, 2) }] };
    case "add_observations":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.addObservations(args.observations as { entityName: string; contents: string[] }[]), null, 2) }] };
    case "delete_entities":
      await knowledgeGraphManager.deleteEntities(args.entityNames as string[]);
      return { content: [{ type: "text", text: "Entities deleted successfully" }] };
    case "delete_observations":
      await knowledgeGraphManager.deleteObservations(args.deletions as { entityName: string; observations: string[] }[]);
      return { content: [{ type: "text", text: "Observations deleted successfully" }] };
    case "delete_relations":
      await knowledgeGraphManager.deleteRelations(args.relations as Relation[]);
      return { content: [{ type: "text", text: "Relations deleted successfully" }] };
    case "read_graph":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.readGraph(), null, 2) }] };
    case "search_nodes":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.searchNodes(args.query as string), null, 2) }] };
    case "open_nodes":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.openNodes(args.names as string[]), null, 2) }] };
    case "create_structural_tension_chart":
      const chartResult = await knowledgeGraphManager.createStructuralTensionChart(
        args.desiredOutcome as string,
        args.currentReality as string,
        args.dueDate as string,
        args.actionSteps as string[]
      );
      return { content: [{ type: "text", text: JSON.stringify(chartResult, null, 2) }] };
    case "telescope_action_step":
      const telescopeResult = await knowledgeGraphManager.telescopeActionStep(
        args.actionStepName as string,
        args.newCurrentReality as string,
        args.initialActionSteps as string[]
      );
      return { content: [{ type: "text", text: JSON.stringify(telescopeResult, null, 2) }] };
    case "mark_action_complete":
      await knowledgeGraphManager.markActionStepComplete(args.actionStepName as string);
      return { content: [{ type: "text", text: `Action step '${args.actionStepName}' marked as complete and current reality updated` }] };
    case "get_chart_progress":
      const progressResult = await knowledgeGraphManager.getChartProgress(args.chartId as string);
      return { content: [{ type: "text", text: JSON.stringify(progressResult, null, 2) }] };
    case "list_active_charts":
      const chartsResult = await knowledgeGraphManager.listActiveCharts();
      return { content: [{ type: "text", text: JSON.stringify(chartsResult, null, 2) }] };
    case "update_action_progress":
      await knowledgeGraphManager.updateActionProgress(
        args.actionStepName as string,
        args.progressObservation as string,
        args.updateCurrentReality as boolean
      );
      return { content: [{ type: "text", text: `Action step '${args.actionStepName}' progress updated` }] };
    case "update_current_reality":
      await knowledgeGraphManager.updateCurrentReality(
        args.chartId as string,
        args.newObservations as string[]
      );
      return { content: [{ type: "text", text: `Current reality updated for chart '${args.chartId}'` }] };
    case "add_action_step":
      const addActionResult = await knowledgeGraphManager.addActionStep(
        args.parentChartId as string,
        args.actionStepTitle as string,
        args.dueDate as string,
        args.currentReality as string
      );
      return { content: [{ type: "text", text: `Action step '${args.actionStepTitle}' added to chart '${args.parentChartId}' as telescoped chart '${addActionResult.chartId}'` }] };
    case "remove_action_step":
      await knowledgeGraphManager.removeActionStep(
        args.parentChartId as string,
        args.actionStepName as string
      );
      return { content: [{ type: "text", text: `Action step '${args.actionStepName}' removed from chart '${args.parentChartId}'` }] };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("COAIA Memory - Creative Oriented AI Assistant Memory Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
