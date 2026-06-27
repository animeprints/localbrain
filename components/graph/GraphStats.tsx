'use client'

import { useMemo } from 'react'

interface GraphStatsProps {
  nodes: Array<{ id: string; label: string; type: string; degree: number }>
  edges: Array<{ id: string; source_node_id: string; target_node_id: string; weight: number }>
}

export default function GraphStats({ nodes, edges }: GraphStatsProps) {
  const stats = useMemo(() => {
    if (nodes.length === 0) return null

    const typeCount = nodes.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avgDegree = nodes.reduce((sum, n) => sum + n.degree, 0) / nodes.length
    const maxDegree = Math.max(...nodes.map((n) => n.degree))
    const topNodes = [...nodes].sort((a, b) => b.degree - a.degree).slice(0, 5)
    const density = nodes.length > 1 ? (2 * edges.length) / (nodes.length * (nodes.length - 1)) : 0

    return { typeCount, avgDegree, maxDegree, topNodes, density }
  }, [nodes, edges])

  if (!stats) return null

  const typeColors: Record<string, string> = {
    concept: '#3b9eff',
    entity: '#a855f7',
    tag: '#11ff99',
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
        <div className="text-2xl font-medium text-[#fcfdff]">{nodes.length}</div>
        <div className="text-xs text-[#464a4d]">Total Nodes</div>
      </div>
      <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
        <div className="text-2xl font-medium text-[#fcfdff]">{edges.length}</div>
        <div className="text-xs text-[#464a4d]">Total Edges</div>
      </div>
      <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
        <div className="text-2xl font-medium text-[#fcfdff]">{stats.avgDegree.toFixed(1)}</div>
        <div className="text-xs text-[#464a4d]">Avg Connections</div>
      </div>
      <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
        <div className="text-2xl font-medium text-[#fcfdff]">{(stats.density * 100).toFixed(1)}%</div>
        <div className="text-xs text-[#464a4d]">Graph Density</div>
      </div>

      <div className="col-span-2 md:col-span-4 p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
        <div className="text-xs text-[#464a4d] mb-2">By Type</div>
        <div className="flex gap-3">
          {Object.entries(stats.typeCount).map(([type, count]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: typeColors[type] || '#3b9eff' }} />
              <span className="text-xs text-[#a1a4a5] capitalize">{type}: {count}</span>
            </div>
          ))}
        </div>
      </div>

      {stats.topNodes.length > 0 && (
        <div className="col-span-2 md:col-span-4 p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
          <div className="text-xs text-[#464a4d] mb-2">Most Connected</div>
          <div className="flex flex-wrap gap-2">
            {stats.topNodes.map((n) => (
              <span key={n.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#101012] text-[#a1a4a5]">
                {n.label}
                <span className="text-[#464a4d]">({n.degree})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
