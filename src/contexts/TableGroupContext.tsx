import { createContext, useContext, useState, ReactNode } from 'react'

export interface Table {
  name: string
}

export interface TableGroupData {
  name: string
  tables: Table[]
  color?: string
  shardCount?: number
}

interface TableGroupContextType {
  tableGroups: TableGroupData[]
  addTableGroup: (name: string, shardCount?: number, color?: string) => void
  addTableToGroup: (groupName: string, tableName: string) => void
  processAddedItems: (addedItems: string[]) => void
}

const TableGroupContext = createContext<TableGroupContextType | undefined>(undefined)

export function useTableGroup() {
  const context = useContext(TableGroupContext)
  if (context === undefined) {
    throw new Error('useTableGroup must be used within a TableGroupProvider')
  }
  return context
}

interface TableGroupProviderProps {
  children: ReactNode
}

// Generate random colors for new table groups - muted colors for better readability
const generateColor = () => {
  const colors = [
    '#6b8db5', // muted blue
    '#b56b6b', // muted red
    '#6bb56b', // muted green
    '#b56bb5', // muted purple
    '#b5946b', // muted orange/brown
    '#6bb5b5', // muted teal
    '#9b6bb5', // muted violet
    '#b5b56b', // muted olive
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function TableGroupProvider({ children }: TableGroupProviderProps) {
  const [tableGroups, setTableGroups] = useState<TableGroupData[]>([
    {
      name: 'default',
      tables: [],
      color: '#4a9eff',
      shardCount: 0 // Default group has no shards
    }
  ])

  const addTableGroup = (name: string, shardCount?: number, color?: string) => {
    setTableGroups(prev => {
      // Don't add if group already exists
      if (prev.some(group => group.name === name)) {
        return prev
      }

      // Default group is special - it has no shards
      const finalShardCount = name === 'default' ? 0 : (shardCount || 1)

      return [...prev, {
        name,
        tables: [],
        color: color || generateColor(),
        shardCount: finalShardCount
      }]
    })
  }

  const addTableToGroup = (groupName: string, tableName: string) => {
    setTableGroups(prev =>
      prev.map(group => {
        if (group.name === groupName) {
          // Don't add if table already exists in this group
          if (group.tables.some(table => table.name === tableName)) {
            return group
          }
          return {
            ...group,
            tables: [...group.tables, { name: tableName }]
          }
        }
        return group
      })
    )
  }

  const processAddedItems = (addedItems: string[]) => {
    if (!addedItems || addedItems.length === 0) return

    addedItems.forEach(item => {
      if (item.includes('.')) {
        // Format: "TABLEGROUP.TABLE"
        const [groupName, tableName] = item.split('.')
        if (groupName && tableName) {
          // Ensure the group exists first
          addTableGroup(groupName)
          // Then add the table to it
          addTableToGroup(groupName, tableName)
        }
      } else if (item.includes(':')) {
        // Format: "TABLEGROUP:SHARDCOUNT"
        const [groupName, shardCountStr] = item.split(':')
        const shardCount = parseInt(shardCountStr, 10)
        if (groupName && !isNaN(shardCount) && shardCount > 0) {
          addTableGroup(groupName, shardCount)
        }
      } else {
        // Format: "TABLEGROUP" (default to 1 shard)
        addTableGroup(item)
      }
    })
  }

  const value = {
    tableGroups,
    addTableGroup,
    addTableToGroup,
    processAddedItems,
  }

  return (
    <TableGroupContext.Provider value={value}>
      {children}
    </TableGroupContext.Provider>
  )
}