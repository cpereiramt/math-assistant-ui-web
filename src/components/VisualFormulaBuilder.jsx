import React, { useMemo, useState } from "react";

const operators = [
  { value: "ADD", label: "Addition", symbol: "+", arity: 2 },
  { value: "SUBTRACT", label: "Subtraction", symbol: "−", arity: 2 },
  { value: "MULTIPLY", label: "Multiplication", symbol: "×", arity: 2 },
  { value: "DIVIDE", label: "Division", symbol: "÷", arity: 2 },
  { value: "POWER", label: "Power", symbol: "^", arity: 2 },
  { value: "NEGATE", label: "Negation", symbol: "−x", arity: 1 },
];

const makeId = () =>
  globalThis.crypto?.randomUUID?.() || `node-${Date.now()}-${Math.random()}`;

function createNode(item) {
  if (item.kind === "formula") {
    return {
      id: makeId(),
      type: "FORMULA",
      sourceFormulaId: item.formula.id,
      sourceName: item.formula.name,
      bindings: Object.fromEntries(
        (item.formula.parameters || []).map((parameter) => [parameter, null]),
      ),
    };
  }
  if (item.kind === "operator") {
    const operator = operators.find(({ value }) => value === item.operator);
    return {
      id: makeId(),
      type: "OPERATOR",
      operator: item.operator,
      children: Array(operator?.arity || 2).fill(null),
    };
  }
  if (item.kind === "variable") {
    return { id: makeId(), type: "VARIABLE", variableName: "X" };
  }
  return { id: makeId(), type: "CONSTANT", constantValue: "1" };
}

function updateNode(root, targetId, changes) {
  if (!root) return root;
  if (root.id === targetId) return { ...root, ...changes };
  if (root.type === "OPERATOR") {
    return {
      ...root,
      children: root.children.map((child) => updateNode(child, targetId, changes)),
    };
  }
  if (root.type === "FORMULA") {
    return {
      ...root,
      bindings: Object.fromEntries(
        Object.entries(root.bindings).map(([key, child]) => [
          key,
          updateNode(child, targetId, changes),
        ]),
      ),
    };
  }
  return root;
}

function PaletteItem({ item, children }) {
  const handleDragStart = (event) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm hover:border-blue-400 hover:bg-blue-50 active:cursor-grabbing"
    >
      {children}
    </button>
  );
}

function DropSlot({ label, onDrop }) {
  const [active, setActive] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setActive(false);
    try {
      onDrop(createNode(JSON.parse(event.dataTransfer.getData("application/json"))));
    } catch {
      // Ignore drags that did not originate in the builder palette.
    }
  };

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={() => setActive(true)}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
      className={`min-h-20 rounded-md border-2 border-dashed p-3 text-center text-sm transition ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-slate-300 bg-slate-50 text-slate-500"
      }`}
    >
      Drop {label} here
    </div>
  );
}

function ExpressionNode({ node, onChange, onRemove, onSelect, selectedId }) {
  const setChild = (index, child) => {
    const children = [...node.children];
    children[index] = child;
    onChange({ ...node, children });
  };
  const setBinding = (parameter, child) => {
    onChange({ ...node, bindings: { ...node.bindings, [parameter]: child } });
  };
  const operator = operators.find(({ value }) => value === node.operator);

  return (
    <div
      className={`rounded-lg border p-3 ${
        selectedId === node.id
          ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-100"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="text-left text-sm font-semibold text-slate-800"
        >
          {node.type === "FORMULA" && `Formula · ${node.sourceName || node.sourceFormulaId}`}
          {node.type === "OPERATOR" && `Operator · ${operator?.symbol || node.operator}`}
          {node.type === "VARIABLE" && `Variable · ${node.variableName}`}
          {node.type === "CONSTANT" && `Constant · ${node.constantValue}`}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Remove
        </button>
      </div>

      {node.type === "OPERATOR" && (
        <div className="grid gap-3 md:grid-cols-2">
          {node.children.map((child, index) =>
            child ? (
              <ExpressionNode
                key={child.id}
                node={child}
                onChange={(next) => setChild(index, next)}
                onRemove={() => setChild(index, null)}
                onSelect={onSelect}
                selectedId={selectedId}
              />
            ) : (
              <DropSlot
                key={`${node.id}-${index}`}
                label={`operand ${index + 1}`}
                onDrop={(next) => setChild(index, next)}
              />
            ),
          )}
        </div>
      )}

      {node.type === "FORMULA" && (
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(node.bindings || {}).map(([parameter, child]) => (
            <div key={parameter}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {parameter}
              </p>
              {child ? (
                <ExpressionNode
                  node={child}
                  onChange={(next) => setBinding(parameter, next)}
                  onRemove={() => setBinding(parameter, null)}
                  onSelect={onSelect}
                  selectedId={selectedId}
                />
              ) : (
                <DropSlot label={parameter} onDrop={(next) => setBinding(parameter, next)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VisualFormulaBuilder({ catalog, tree, onTreeChange }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const filteredCatalog = useMemo(
    () =>
      catalog.filter((formula) =>
        `${formula.name} ${formula.group}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [catalog, search],
  );

  const selectedNode = useMemo(() => {
    let result = null;
    const visit = (node) => {
      if (!node || result) return;
      if (node.id === selectedId) result = node;
      (node.children || []).forEach(visit);
      Object.values(node.bindings || {}).forEach(visit);
    };
    visit(tree);
    return result;
  }, [tree, selectedId]);

  const changeSelected = (changes) => {
    onTreeChange(updateNode(tree, selectedId, changes));
  };

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)_220px]">
      <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h2 className="font-semibold text-slate-900">Blocks</h2>
        <p className="mt-1 text-xs text-slate-500">Drag a block into an empty slot.</p>

        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Inputs</h3>
        <div className="mt-2 grid gap-2">
          <PaletteItem item={{ kind: "variable" }}>Variable</PaletteItem>
          <PaletteItem item={{ kind: "constant" }}>Constant</PaletteItem>
        </div>

        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Operators</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {operators.map((operator) => (
            <PaletteItem key={operator.value} item={{ kind: "operator", operator: operator.value }}>
              <span className="font-mono text-base">{operator.symbol}</span>
            </PaletteItem>
          ))}
        </div>

        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Fixed formulas</h3>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search formulas"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <div className="mt-2 grid max-h-72 gap-2 overflow-y-auto pr-1">
          {filteredCatalog.map((formula) => (
            <PaletteItem key={formula.id} item={{ kind: "formula", formula }}>
              <span className="block font-medium">{formula.name}</span>
              <span className="block text-xs text-slate-500">
                {(formula.parameters || []).join(", ") || "No parameters"}
              </span>
            </PaletteItem>
          ))}
          {filteredCatalog.length === 0 && (
            <p className="py-3 text-xs text-slate-500">No fixed formulas found.</p>
          )}
        </div>
      </aside>

      <section className="min-h-96 rounded-lg border border-slate-200 bg-slate-100/60 p-4">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-900">Expression canvas</h2>
          <p className="text-xs text-slate-500">Build from the root and fill every required slot.</p>
        </div>
        {tree ? (
          <ExpressionNode
            node={tree}
            onChange={onTreeChange}
            onRemove={() => {
              onTreeChange(null);
              setSelectedId(null);
            }}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        ) : (
          <DropSlot label="the root expression" onDrop={onTreeChange} />
        )}
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Properties</h2>
        {!selectedNode && (
          <p className="mt-2 text-sm text-slate-500">Select a variable or constant to edit it.</p>
        )}
        {selectedNode?.type === "VARIABLE" && (
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Variable name
            <input
              value={selectedNode.variableName}
              onChange={(event) => changeSelected({ variableName: event.target.value.toUpperCase() })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
            />
          </label>
        )}
        {selectedNode?.type === "CONSTANT" && (
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Numeric value
            <input
              type="number"
              step="any"
              value={selectedNode.constantValue}
              onChange={(event) => changeSelected({ constantValue: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
            />
          </label>
        )}
        {selectedNode?.type === "FORMULA" && (
          <p className="mt-3 text-sm text-slate-600">Source: {selectedNode.sourceName}</p>
        )}
        {selectedNode?.type === "OPERATOR" && (
          <p className="mt-3 text-sm text-slate-600">
            Operator: {operators.find(({ value }) => value === selectedNode.operator)?.label}
          </p>
        )}
      </aside>
    </div>
  );
}
