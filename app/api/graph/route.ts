import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const typeFilter = searchParams.get('type')

  let nodesQuery = supabase
    .from('graph_nodes')
    .select('id, label, type, created_at')
    .eq('user_id', user!.id)

  if (typeFilter) {
    nodesQuery = nodesQuery.eq('type', typeFilter)
  }

  const { data: nodes, error: nodesError } = await nodesQuery

  if (nodesError) {
    return Response.json({ error: nodesError.message }, { status: 500 })
  }

  const nodeIds = nodes?.map((n) => n.id) ?? []

  const { data: edges, error: edgesError } = await supabase
    .from('graph_edges')
    .select('id, source_node_id, target_node_id, relationship, weight')
    .eq('user_id', user!.id)
    .in('source_node_id', nodeIds.length > 0 ? nodeIds : ['00000000-0000-0000-0000-000000000000'])

  if (edgesError) {
    return Response.json({ error: edgesError.message }, { status: 500 })
  }

  const degreeMap = new Map<string, number>()
  for (const edge of edges ?? []) {
    degreeMap.set(edge.source_node_id, (degreeMap.get(edge.source_node_id) ?? 0) + 1)
    degreeMap.set(edge.target_node_id, (degreeMap.get(edge.target_node_id) ?? 0) + 1)
  }

  const enrichedNodes = nodes?.map((n) => ({
    ...n,
    degree: degreeMap.get(n.id) ?? 0,
  }))

  return Response.json({
    nodes: enrichedNodes ?? [],
    edges: edges ?? [],
  })
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { action } = body as { action: string }

  const supabase = await createClient()

  if (action === 'create-node') {
    const { label, type } = body as { label: string; type: string }
    if (!label) return Response.json({ error: 'Missing label' }, { status: 400 })

    const { data, error: insertError } = await supabase
      .from('graph_nodes')
      .insert({ user_id: user!.id, label: label.trim(), type: type || 'concept' })
      .select()
      .single()

    if (insertError) return Response.json({ error: insertError.message }, { status: 500 })
    return Response.json({ node: data })
  }

  if (action === 'create-edge') {
    const { sourceNodeId, targetNodeId, relationship } = body as {
      sourceNodeId: string
      targetNodeId: string
      relationship?: string
    }

    if (!sourceNodeId || !targetNodeId) {
      return Response.json({ error: 'Missing node IDs' }, { status: 400 })
    }

    if (sourceNodeId === targetNodeId) {
      return Response.json({ error: 'Cannot create self-loop' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('graph_edges')
      .select('id')
      .eq('user_id', user!.id)
      .or(`and(source_node_id.eq.${sourceNodeId},target_node_id.eq.${targetNodeId}),and(source_node_id.eq.${targetNodeId},target_node_id.eq.${sourceNodeId})`)
      .single()

    if (existing) {
      return Response.json({ error: 'Edge already exists' }, { status: 409 })
    }

    const { data, error: insertError } = await supabase
      .from('graph_edges')
      .insert({
        user_id: user!.id,
        source_node_id: sourceNodeId,
        target_node_id: targetNodeId,
        relationship: relationship || 'related_to',
        weight: 1.0,
      })
      .select()
      .single()

    if (insertError) return Response.json({ error: insertError.message }, { status: 500 })
    return Response.json({ edge: data })
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { nodeId, edgeId } = body as { nodeId?: string; edgeId?: string }

  const supabase = await createClient()

  if (edgeId) {
    const { error: delError } = await supabase
      .from('graph_edges')
      .delete()
      .eq('id', edgeId)
      .eq('user_id', user!.id)

    if (delError) return Response.json({ error: delError.message }, { status: 500 })
    return Response.json({ success: true })
  }

  if (!nodeId) {
    return Response.json({ error: 'Missing nodeId or edgeId' }, { status: 400 })
  }

  await supabase
    .from('graph_edges')
    .delete()
    .eq('user_id', user!.id)
    .or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`)

  const { error: delError } = await supabase
    .from('graph_nodes')
    .delete()
    .eq('id', nodeId)
    .eq('user_id', user!.id)

  if (delError) {
    return Response.json({ error: delError.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
