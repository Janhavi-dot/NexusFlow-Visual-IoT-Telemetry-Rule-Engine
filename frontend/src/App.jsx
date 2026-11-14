
import { useCallback, useRef } from "react";

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

import "@xyflow/react/dist/style.css";
import "./index.css";

// Initial workflow nodes
const initialNodes = [
  {
    id: "1",
    position: { x: 100, y: 150 },
    data: { label: "Temperature Sensor" },
    style: {
      background: "#172554",
      color: "#ffffff",
      border: "1px solid #3b82f6",
      borderRadius: "10px",
      padding: "15px",
      width: 180,
    },
  },
  {
    id: "2",
    position: { x: 400, y: 150 },
    data: { label: "Moving Average Filter" },
    style: {
      background: "#312e81",
      color: "#ffffff",
      border: "1px solid #818cf8",
      borderRadius: "10px",
      padding: "15px",
      width: 190,
    },
  },
  {
    id: "3",
    position: { x: 700, y: 150 },
    data: { label: "SMS Alert" },
    style: {
      background: "#064e3b",
      color: "#ffffff",
      border: "1px solid #10b981",
      borderRadius: "10px",
      padding: "15px",
      width: 150,
    },
  },
];

// Initial workflow connections
const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
  },
];

// Node styles
const nodeStyles = {
  temperature: {
    label: "Temperature Sensor",
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

  const { screenToFlowPosition } = useReactFlow();

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
        position,
        data: {
          label: nodeStyles[nodeType].label,
        },
        style: {
          ...nodeStyles[nodeType].style,
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
          <span className="status-dot"></span>
          Workflow Editor
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

            <span className="canvas-badge">
              Draft Workflow
            </span>
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
