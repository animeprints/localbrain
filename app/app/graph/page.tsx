'use client'

import { useState, useEffect, useCallback } from 'react'
import KnowledgeGraph from '@/components/graph/KnowledgeGraph'
import toast from 'react-hot-toast'

interface GraphNode {
  id: string
  label: string
  type: string
  degree: number
}

interface GraphEdge {
  id: string
  source_node_id: string
  target_node_id: string
  relationship: string
  weight: number
}

export default function GraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [filter, setFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createMode, setCreateMode] = useState<'node' | 'edge'>('node')
  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState('concept')
  const [newRelationship, setNewRelationship] = useState('related_to')
  const [edgeSource, setEdgeSource] = useState('')
  const [edgeTarget, setEdgeTarget] = useState('')

  const fetchGraph = useCallback(async () => {
    setLoading(true)
    const params = filter ? `?type=${filter}` : ''
    const res = await fetch(`/api/graph${params}`)
    if (res.ok) {
      const data = await res.json()
      setNodes(data.nodes)
      setEdges(data.edges)
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchGraph()
  }, [fetchGraph])

  const createNode = async () => {
    if (!newLabel.trim()) return
    const res = await fetch('/api/graph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create-node', label: newLabel, type: newType }),
    })
    if (res.ok) {
      const data = await res.json()
      setNodes([...nodes, { ...data.node, degree: 0 }])
      setNewLabel('')
      setShowCreate(false)
      toast.success('Node created')
    } else {
      const err = await res.json()
      toast.error(err.error || 'Failed')
    }
  }

  const createEdge = async () => {
    if (!edgeSource || !edgeTarget) return
    const res = await fetch('/api/graph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-edge',
        sourceNodeId: edgeSource,
        targetNodeId: edgeTarget,
        relationship: newRelationship,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setEdges([...edges, data.edge])
      setEdgeSource('')
      setEdgeTarget('')
      setNewRelationship('related_to')
      setShowCreate(false)
      fetchGraph()
      toast.success('Edge created')
    } else {
      const err = await res.json()
      toast.error(err.error || 'Failed')
    }
  }

  const deleteNode = async () => {
    if (!selectedNode) return
    const res = await fetch('/api/graph', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId: selectedNode.id }),
    })
    if (res.ok) {
      setNodes(nodes.filter((n) => n.id !== selectedNode.id))
      setEdges(edges.filter((e) => e.source_node_id !== selectedNode.id && e.target_node_id !== selectedNode.id))
      setSelectedNode(null)
      toast.success('Node deleted')
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#464a4d]">
            Loading graph...
          </div>
        ) : (
          <KnowledgeGraph nodes={nodes} edges={edges} onNodeClick={setSelectedNode} />
        )}

        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {['', 'concept', 'entity', 'tag'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                filter === type
                  ? 'bg-white text-black'
                  : 'bg-[#101012] text-[#a1a4a5] border border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.24)]'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>

        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#f1f7fe] transition-all duration-200 hover:scale-105"
          >
            + New
          </button>
        </div>

        {showCreate && (
          <div className="absolute top-14 right-4 w-72 bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-xl p-4 z-50 animate-fade-in-up shadow-xl">
            <div className="flex gap-1 mb-3">
              <button
                onClick={() => setCreateMode('node')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${createMode === 'node' ? 'bg-[#101012] text-[#fcfdff]' : 'text-[#464a4d] hover:text-[#a1a4a5]'}`}
              >
                Node
              </button>
              <button
                onClick={() => setCreateMode('edge')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${createMode === 'edge' ? 'bg-[#101012] text-[#fcfdff]' : 'text-[#464a4d] hover:text-[#a1a4a5]'}`}
              >
                Edge
              </button>
            </div>

            {createMode === 'node' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createNode()}
                  placeholder="Node label..."
                  className="w-full bg-[#06060a] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff]"
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#06060a] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff]"
                >
                  <option value="concept">Concept</option>
                  <option value="entity">Entity</option>
                  <option value="tag">Tag</option>
                </select>
                <button onClick={createNode} className="w-full py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#f1f7fe] transition-colors">
                  Create Node
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={edgeSource}
                  onChange={(e) => setEdgeSource(e.target.value)}
                  className="w-full bg-[#06060a] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff]"
                >
                  <option value="">Source node...</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  placeholder="Relationship..."
                  className="w-full bg-[#06060a] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff]"
                />
                <select
                  value={edgeTarget}
                  onChange={(e) => setEdgeTarget(e.target.value)}
                  className="w-full bg-[#06060a] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff]"
                >
                  <option value="">Target node...</option>
                  {nodes.filter((n) => n.id !== edgeSource).map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
                <button onClick={createEdge} className="w-full py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#f1f7fe] transition-colors">
                  Create Edge
                </button>
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-4 right-4 text-xs text-[#464a4d]">
          {nodes.length} nodes · {edges.length} edges
        </div>
      </div>

      {selectedNode && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSelectedNode(null)} />
          <div className="fixed bottom-0 left-0 right-0 md:static md:w-72 z-50 md:z-auto border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.06)] p-4 overflow-auto animate-slide-up md:animate-fade-in-left bg-[#000000] md:bg-transparent max-h-[60vh] md:max-h-none rounded-t-xl md:rounded-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{selectedNode.label}</h3>
              <button onClick={() => setSelectedNode(null)} className="text-[#464a4d] hover:text-[#fcfdff] transition-colors">x</button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[#a1a4a5]">Type</span>
                <p className="text-sm capitalize">{selectedNode.type}</p>
              </div>
              <div>
                <span className="text-xs text-[#a1a4a5]">Connections</span>
                <p className="text-sm">{selectedNode.degree}</p>
              </div>
            </div>
            <button onClick={deleteNode} className="mt-6 w-full px-3 py-2 text-xs font-medium text-[#ff2047] bg-[rgba(255,32,71,0.08)] hover:bg-[rgba(255,32,71,0.15)] rounded-lg transition-all duration-200">
              Delete Node
            </button>
          </div>
        </>
      )}
    </div>
  )
}
