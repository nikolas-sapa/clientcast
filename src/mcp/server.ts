#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import {
  InitSchema,
  SendSchema,
  StatusSchema,
  ListSchema,
  ExportSchema,
  clientInit,
  clientSend,
  clientStatus,
  clientList,
  clientExport,
} from './tools.js';

const server = new Server(
  { name: 'clientcast', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

const tools = [
  {
    name: 'client_init',
    description:
      'Initialize clientcast in the current project. Creates .clientcast.json with project + client metadata.',
    inputSchema: zodToJSONSchema(InitSchema),
  },
  {
    name: 'client_send',
    description:
      'Generate and upload a client update from recent git commits. Returns shareable URL.',
    inputSchema: zodToJSONSchema(SendSchema),
  },
  {
    name: 'client_status',
    description:
      'Get status of a specific update (or the latest). Includes replies and scope-creep flags.',
    inputSchema: zodToJSONSchema(StatusSchema),
  },
  {
    name: 'client_list',
    description: 'List recent updates for the current project.',
    inputSchema: zodToJSONSchema(ListSchema),
  },
  {
    name: 'client_export',
    description: 'Export an update as markdown or email format.',
    inputSchema: zodToJSONSchema(ExportSchema),
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const text = await runTool(name, args ?? {});
    return { content: [{ type: 'text', text }] };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      content: [{ type: 'text', text: JSON.stringify({ ok: false, error: msg }) }],
      isError: true,
    };
  }
});

async function runTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'client_init':
      return clientInit(InitSchema.parse(args));
    case 'client_send':
      return clientSend(SendSchema.parse(args));
    case 'client_status':
      return clientStatus(StatusSchema.parse(args));
    case 'client_list':
      return clientList(ListSchema.parse(args));
    case 'client_export':
      return clientExport(ExportSchema.parse(args));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function zodToJSONSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  // Minimal converter sufficient for our flat object schemas.
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [k, v] of Object.entries(shape)) {
      properties[k] = zodFieldToJSONSchema(v);
      if (!v.isOptional()) required.push(k);
    }
    return { type: 'object', properties, required, additionalProperties: false };
  }
  return { type: 'object' };
}

function zodFieldToJSONSchema(field: z.ZodTypeAny): Record<string, unknown> {
  let inner = field;
  while (inner instanceof z.ZodOptional || inner instanceof z.ZodNullable) {
    inner = inner._def.innerType;
  }
  if (inner instanceof z.ZodString) return { type: 'string' };
  if (inner instanceof z.ZodNumber) return { type: 'number' };
  if (inner instanceof z.ZodBoolean) return { type: 'boolean' };
  if (inner instanceof z.ZodEnum) return { type: 'string', enum: inner._def.values };
  return { type: 'string' };
}

const transport = new StdioServerTransport();
await server.connect(transport);
