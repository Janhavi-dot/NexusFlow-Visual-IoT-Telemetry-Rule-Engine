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

export function compileWorkflow(nodes, edges) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const incoming = {};
  edges.forEach((edge) => {
    if (!incoming[edge.target]) incoming[edge.target] = [];
    incoming[edge.target].push(edge.source);
  });

  const sensors = nodes.filter((node) =>
    SENSOR_LABELS.includes(node.data.label)
  );

  if (!sensors.length) {
    return {
      success: false,
      logs: ["No sensor nodes found in the workflow."],
      execute: () => [],
      stop: () => {},
    };
  }

  const supported = [...SENSOR_LABELS, ...MATH_LABELS, ...ACTION_LABELS];

  const unsupported = nodes.filter(
    (node) => !supported.includes(node.data.label)
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

  function execute() {
    const values = {};
    const logs = [];
    const visited = new Set();

    // Generate simulated sensor readings
    sensors.forEach((sensor) => {
      let value;

      switch (sensor.data.label) {
        case "Temperature Sensor":
          value = Number((20 + Math.random() * 15).toFixed(2));
          break;
        case "Humidity Sensor":
          value = Number((30 + Math.random() * 60).toFixed(2));
          break;
        case "Motion Sensor":
          value = Math.random() > 0.5 ? 1 : 0;
          break;
        case "Light Sensor":
          value = Math.round(Math.random() * 1000);
          break;
        default:
          value = Math.round(Math.random() * 100);
      }

      values[sensor.id] = value;
      logs.push(`${sensor.data.label}: ${value}`);
    });

    function evaluate(nodeId) {
      if (visited.has(nodeId)) return values[nodeId];

      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return undefined;

      const label = node.data.label;
      const sources = incoming[nodeId] || [];

      if (SENSOR_LABELS.includes(label)) {
        return values[nodeId];
      }

      const inputValues = sources
        .map((sourceId) => evaluate(sourceId))
        .filter((value) => typeof value === "number");

      if (MATH_LABELS.includes(label)) {
        let result;

        switch (label) {
          case "Add":
            result = inputValues.reduce((a, b) => a + b, 0);
            break;

          case "Subtract":
            result =
              inputValues.length >= 2
                ? inputValues[0] - inputValues[1]
                : inputValues[0];
            break;

          case "Multiply":
            result = inputValues.reduce((a, b) => a * b, 1);
            break;

          case "Divide":
            result =
              inputValues.length >= 2 && inputValues[1] !== 0
                ? inputValues[0] / inputValues[1]
                : inputValues.length >= 2
                ? NaN
                : inputValues[0];
            break;

          case "Moving Average Filter":
          case "Moving Average":
            result =
              inputValues.length > 0
                ? inputValues.reduce((a, b) => a + b, 0) /
                  inputValues.length
                : undefined;
            break;

          default:
            result = undefined;
        }

        values[nodeId] = result;

        if (typeof result === "number" && Number.isFinite(result)) {
          logs.push(`${label}: ${Number(result.toFixed(2))}`);
        } else {
          logs.push(`${label}: Unable to calculate`);
        }

        return result;
      }

      if (ACTION_LABELS.includes(label)) {
        inputValues.forEach((value) => {
          logs.push(`${label} triggered with value: ${value}`);
        });

        return inputValues[0];
      }

      return undefined;
    }

    // Evaluate the connected workflow
    nodes.forEach((node) => evaluate(node.id));

    return logs;
  }

  return {
    success: true,
    logs: ["Workflow compiled successfully."],
    execute,
    stop: () => {},
  };
}