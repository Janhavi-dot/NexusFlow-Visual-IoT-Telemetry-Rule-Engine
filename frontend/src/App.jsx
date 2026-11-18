
import { useCallback, useRef, useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from "@xyflow/react";
import CustomNode from "./nodes/CustomNode";

import "@xyflow/react/dist/style.css";
import "./index.css";

// Initial workflow nodes

// Custom React Flow node types
const initialNodes = [
  {
    id: "1",
    type: "custom",
    position: { x: 100, y: 150 },
    data: {
      label: "Temperature Sensor",
      icon: "🌡️",
      category: "Data Source",
      description: "Provides temperature readings",
      accentColor: "#3b82f6",
    },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 400, y: 150 },
    data: {
      label: "Moving Average Filter",
      icon: "📊",
      category: "Math Operation",
      description: "Calculates average sensor values",
      accentColor: "#8b5cf6",
    },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 700, y: 150 },
    data: {
      label: "SMS Alert",
      icon: "🔔",
      category: "Action Trigger",
      description: "Triggers an SMS notification",
      accentColor: "#10b981",
    },
  },
];

// Node styles

const nodeStyles = {
  temperature: {
    label: "Temperature Sensor",
    icon: "🌡️",
    category: "Data Source",
    description: "Provides temperature readings",
    accentColor: "#3b82f6",
    style: {
      background: "#172554",
      color: "#ffffff",
      border: "1px solid #3b82f6",
      borderRadius: "10px",
      padding: "15px",
      width: 180,
    },
  },

  movingAverage: {
    label: "Moving Average Filter",
    icon: "📊",
    category: "Math Operation",
    description: "Calculates average sensor values",
    accentColor: "#8b5cf6",
    style: {
      background: "#312e81",
      color: "#ffffff",
      border: "1px solid #818cf8",
      borderRadius: "10px",
      padding: "15px",
      width: 190,
    },
  },

  sms: {
    label: "SMS Alert",
    icon: "🔔",
    category: "Action Trigger",
    description: "Triggers an SMS notification",
    accentColor: "#10b981",
    style: {
      background: "#064e3b",
      color: "#ffffff",
      border: "1px solid #10b981",
      borderRadius: "10px",
      padding: "15px",
      width: 150,
    },
  },
};

function AppContent() {
  const reactFlowWrapper = useRef(null);
  const [backendStatus, setBackendStatus] = useState("Checking...");
  useEffect(() => {
  const checkBackend = async () => {
    try {
      const response = await fetch("http://localhost:5000/health");

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      setBackendStatus("Connected");
    } catch (error) {
      console.error("Backend connection failed:", error);
      setBackendStatus("Disconnected");
    }
  };

  checkBackend();
}, []);

const { screenToFlowPosition, deleteElements } = useReactFlow();
  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);

  // Connect workflow nodes
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Start dragging a node from the sidebar
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData(
      "application/reactflow",
      nodeType
    );

    event.dataTransfer.effectAllowed = "move";
  };

  // Allow dropping nodes onto the canvas
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Add a new node when dropped onto the canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData(
        "application/reactflow"
      );

      if (!nodeType || !nodeStyles[nodeType]) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
  id: crypto.randomUUID(),
  type: "custom",
  position,
  data: {
    label: nodeStyles[nodeType].label,
    icon: nodeStyles[nodeType].icon,
    category: nodeStyles[nodeType].category,
    description: nodeStyles[nodeType].description,
    accentColor: nodeStyles[nodeType].accentColor,
  },
};

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">N</div>
          <div>
            <h1>NexusFlow</h1>
            <p>Visual IoT Telemetry & Rule Engine</p>
          </div>
        </div>

        <div className="header-status">
  <span
    className="status-dot"
    style={{
      backgroundColor:
        backendStatus === "Connected"
          ? "#22c55e"
          : backendStatus === "Disconnected"
          ? "#ef4444"
          : "#f59e0b",
    }}
  ></span>

  Backend: {backendStatus}
</div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <h2>Node Library</h2>
          <p>Workflow Components</p>

          <div
            className="node-item"
            draggable
            onDragStart={(event) =>
              onDragStart(event, "temperature")
            }
          >
            <span>🌡️</span>
            <div>
              <strong>Temperature Sensor</strong>
              <small>Input Node</small>
            </div>
          </div>

          <div
            className="node-item"
            draggable
            onDragStart={(event) =>
              onDragStart(event, "movingAverage")
            }
          >
            <span>📊</span>
            <div>
              <strong>Moving Average</strong>
              <small>Processing Node</small>
            </div>
          </div>

          <div
            className="node-item"
            draggable
            onDragStart={(event) =>
              onDragStart(event, "sms")
            }
          >
            <span>🔔</span>
            <div>
              <strong>SMS Alert</strong>
              <small>Output Node</small>
            </div>
          </div>

          <div className="sidebar-note">
            Drag nodes and connect them
            to create your workflow.
          </div>
        </aside>

        <section className="canvas-section">
          <div className="canvas-heading">
  <div>
    <h2>Workflow Canvas</h2>
    <p>Design your IoT automation pipeline</p>
  </div>

  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
    <button
      onClick={() => deleteElements({ nodes: nodes.filter((node) => node.selected) })}
      disabled={!nodes.some((node) => node.selected)}
      style={{
        padding: "8px 14px",
        background: nodes.some((node) => node.selected) ? "#991b1b" : "#334155",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        cursor: nodes.some((node) => node.selected) ? "pointer" : "not-allowed",
      }}
    >
      Delete Selected
    </button>

    <span className="canvas-badge">
      Draft Workflow
    </span>
  </div>
</div>

          <div
            className="flow-wrapper"
            ref={reactFlowWrapper}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              fitViewOptions={{ padding: 0.2 }}
            >
              <Background
                color="#64748b"
                gap={20}
                size={1}
              />

              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </section>
      </main>
    </div>
  );
}

// ReactFlowProvider is required for useReactFlow()
function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;
