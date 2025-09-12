import { supabase } from './supabase'

export interface ScriptRow {
  id: number
  created_at: string
  query: string | null
  response: string | null
  notice: string | null
}

export async function fetchAllScriptRows(): Promise<ScriptRow[]> {
  try {
    const { data, error } = await supabase
      .from('script')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching script data:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch script rows:', error)
    return []
  }
}

export async function insertScriptRow(row: Omit<ScriptRow, 'id' | 'created_at'>): Promise<ScriptRow | null> {
  try {
    const { data, error } = await supabase
      .from('script')
      .insert([row])
      .select()
      .single()

    if (error) {
      console.error('Error inserting script row:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to insert script row:', error)
    return null
  }
}