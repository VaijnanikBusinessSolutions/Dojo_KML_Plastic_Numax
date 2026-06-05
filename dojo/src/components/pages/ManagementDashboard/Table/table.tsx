import React from "react";
import styles from "./table.module.css";

interface TableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  // New Prop: function to handle clicking a row
  onRowClick?: (rowIndex: number) => void; 
}

const TableComponent: React.FC<TableProps> = ({ headers, rows, onRowClick }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.headerRow}>
            {headers.map((header, index) => (
              <th key={index} className={styles.th}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {rows.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={styles.row}
              // Add click handler here
              onClick={() => onRowClick && onRowClick(rowIndex)}
              // Add pointer cursor style so user knows it's clickable
              style={{ cursor: 'pointer' }} 
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={styles.td}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;