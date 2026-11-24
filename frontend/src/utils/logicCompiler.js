import { of, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

const SENSOR_LABELS = [
  "Temperature Sensor",
  "Humidity Sensor",
  "Motion Sensor",
  "Light Sensor",
];

const MATH_LABELS = [
  "Add",
  "Subtract",
  "Multiply",
  "Divide",
  "Moving Average Filter",
  "Moving Average",
];

const ACTION_LABELS = [
  "SMS Alert",
  "Email Alert",
  "Push Notification",
];

function generateSensorValue(label) {
  switch (label) {
    case "Temperature Sensor":
      return Number((20 + Math.random() * 15).toFixed(2));

    case "Humidity Sensor":
      return Number((30 + Math.random() * 60).toFixed(2));

    case "Motion Sensor":
      return Math.random() > 0.5 ? 1 : 0;

    case "Light Sensor":
      return Math.round(Math.random() * 1000);

    default:
      return 0;
  }
}

function calculate(label, values) {
  switch (label) {
    case "Add":
      return values.reduce((a, b) => a + b, 0);

    case "Subtract":
      return values.length >= 2
        ? values[0] - values[1]
        : values[0];

    case "Multiply":
      return values.reduce((a, b) => a * b, 1);

    case "Divide":
      if (values.length < 2) return values[0];
      if (values[1] === 0) return NaN;
      return values[0] / values[1];

    case "Moving Average Filter":
    case "Moving Average":
      return values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : undefined;

    default:
      return undefined;
  }
}

export function compileWorkflow(nodes, edges) {
  const logs = [];
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const incoming = {};
  const streams = new Map();

  edges.forEach((edge) => {
    if (!incoming[edge.target]) {
      incoming[edge.target] = [];
    }

    incoming[edge.target].push(edge.source);
  });

  const supportedLabels = [
    ...SENSOR_LABELS,
    ...MATH_LABELS,
    ...ACTION_LABELS,
  ];

  const unsupported = nodes.filter(
    (node) => !supportedLabels.includes(node.data.label)
  );

  if (unsupported.length) {
    return {
      success: false,
      logs: [
        `Unsupported nodes: ${unsupported
          .map((node) => node.data.label)
          .join(", ")}`,
      ],
      execute: () => [],
      stop: () => {},
    };
  }

  if (!nodes.some((node) => SENSOR_LABELS.includes(node.data.label))) {
    return {
      success: false,
      logs: ["No sensor nodes found in the workflow."],
      execute: () => [],
      stop: () => {},
    };
  }

  // Validate connections
  const invalidEdges = edges.filter(
    (edge) => !nodeMap.has(edge.source) || !nodeMap.has(edge.target)
  );

  if (invalidEdges.length) {
    return {
      success: false,
      logs: ["Workflow contains invalid connections."],
      execute: () => [],
      stop: () => {},
    };
  }

  // Detect circular dependencies
  const visiting = new Set();
  const visited = new Set();

  function hasCycle(nodeId) {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visiting.add(nodeId);

    for (const sourceId of incoming[nodeId] || []) {
      if (hasCycle(sourceId)) return true;
    }

    visiting.delete(nodeId);
    visited.add(nodeId);

    return false;
  }

  for (const node of nodes) {
    if (hasCycle(node.id)) {
      return {
        success: false,
        logs: ["Circular dependency detected in workflow."],
        execute: () => [],
        stop: () => {},
      };
    }
  }

  // Build RxJS streams for each node
  function buildStream(nodeId) {
    if (streams.has(nodeId)) {
      return streams.get(nodeId);
    }

    const node = nodeMap.get(nodeId);

    if (!node) return null;

    const label = node.data.label;

    // Sensor nodes create observable streams
    if (SENSOR_LABELS.includes(label)) {
      const sensorStream = of(generateSensorValue(label)).pipe(
        map((value) => {
          logs.push(`${label}: ${value}`);
          return value;
        })
      );

      streams.set(nodeId, sensorStream);
      return sensorStream;
    }

    const sourceIds = incoming[nodeId] || [];

    if (!sourceIds.length) {
      return null;
    }

    const sourceStreams = sourceIds
      .map((sourceId) => buildStream(sourceId))
      .filter(Boolean);

    if (!sourceStreams.length) {
      return null;
    }

    // Math nodes combine input streams and calculate results
    if (MATH_LABELS.includes(label)) {
      const mathStream = combineLatest(sourceStreams).pipe(
        map((values) => {
          const result = calculate(label, values);

          if (typeof result === "number" && Number.isFinite(result)) {
            const formatted = Number(result.toFixed(2));
            logs.push(`${label}: ${formatted}`);
            return formatted;
          }

          logs.push(`${label}: Unable to calculate`);
          return result;
        })
      );

      streams.set(nodeId, mathStream);
      return mathStream;
    }

    // Action nodes consume values from upstream streams
    if (ACTION_LABELS.includes(label)) {
      const actionStream = combineLatest(sourceStreams).pipe(
        map((values) => {
          values.forEach((value) => {
            logs.push(`${label} triggered with value: ${value}`);
          });

          return values[0];
        })
      );

      streams.set(nodeId, actionStream);
      return actionStream;
    }

    return null;
  }

  nodes.forEach((node) => buildStream(node.id));

  return {
    success: true,
    logs: ["Workflow compiled successfully."],

    execute() {
      logs.length = 0;

      const subscriptions = [];

      // Subscribe to terminal/action nodes
      const actionNodes = nodes.filter((node) =>
        ACTION_LABELS.includes(node.data.label)
      );

      const targets = actionNodes.length
        ? actionNodes
        : nodes.filter((node) => !(edges.some((edge) => edge.source === node.id)));

      targets.forEach((node) => {
        const stream = buildStream(node.id);

        if (stream) {
          subscriptions.push(
            stream.subscribe({
              error: (error) => logs.push(`Execution error: ${error.message}`),
            })
          );
        }
      });

      subscriptions.forEach((subscription) => subscription.unsubscribe());

      return [...logs];
    },

    stop() {},
  };
}