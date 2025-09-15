import React from 'react'
import './TableGroup.css'
import { useTableGroup, TableGroupData } from '../contexts/TableGroupContext'

const TableGroup: React.FC<TableGroupData> = ({ name, tables, color = '#4a9eff', shardCount = 1 }) => {
  // Sort tables alphabetically
  const sortedTables = [...tables].sort((a, b) => a.name.localeCompare(b.name))

  // Default group is special - it has no shards, just tables
  const isDefaultGroup = name === 'default'

  if (isDefaultGroup) {
    return (
      <div className="table-group" style={{ borderColor: color, backgroundColor: `${color}15` }}>
        <div className="table-group-name" style={{ backgroundColor: color }}>
          {name}
        </div>
        <div className="tables-container">
          {sortedTables.length === 0 ? (
            <div className="no-tables-message">(no tables)</div>
          ) : (
            sortedTables.map((table, index) => (
              <div key={index} className="table-item">
                {table.name}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // Non-default groups have shards
  const shards = Array.from({ length: shardCount }, (_, index) => ({
    index,
    tables: sortedTables // Each shard contains all tables in sorted order
  }))

  return (
    <div className="table-group" style={{ borderColor: color, backgroundColor: `${color}15` }}>
      <div className="table-group-name" style={{ backgroundColor: color }}>
        {name}
      </div>
      <div className="shards-container">
        {shards.map((shard) => (
          <div key={shard.index} className="shard">
            <div className="shard-header">Shard {shard.index + 1}</div>
            <div className="shard-tables">
              {shard.tables.length === 0 ? (
                <div className="no-tables-message">(no tables)</div>
              ) : (
                shard.tables.map((table, tableIndex) => (
                  <div key={tableIndex} className="table-item">
                    {table.name}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TableGroups: React.FC = () => {
  const { tableGroups } = useTableGroup()

  return (
    <div className="table-groups-container">
      <h3 className="table-groups-title">Table Groups</h3>
      <div className="table-groups-grid">
        {tableGroups.map((group, index) => (
          <TableGroup
            key={index}
            name={group.name}
            tables={group.tables}
            color={group.color}
            shardCount={group.shardCount}
          />
        ))}
      </div>
    </div>
  )
}

export default TableGroups