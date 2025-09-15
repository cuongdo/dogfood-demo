import React from 'react'
import './TableGroup.css'
import { useTableGroup, TableGroupData } from '../contexts/TableGroupContext'

const TableGroup: React.FC<TableGroupData> = ({ name, tables, color = '#4a9eff' }) => {
  return (
    <div className="table-group" style={{ borderColor: color, backgroundColor: `${color}15` }}>
      <div className="table-group-name" style={{ backgroundColor: color }}>
        {name}
      </div>
      <div className="tables-container">
        {tables.length === 0 ? (
          <div className="no-tables-message">(no tables)</div>
        ) : (
          tables.map((table, index) => (
            <div key={index} className="table-item">
              {table.name}
            </div>
          ))
        )}
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
          />
        ))}
      </div>
    </div>
  )
}

export default TableGroups