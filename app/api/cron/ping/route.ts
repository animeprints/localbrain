import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      notesCount: count ?? 0,
      message: 'Database ping successful',
    })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 })
  }
}
