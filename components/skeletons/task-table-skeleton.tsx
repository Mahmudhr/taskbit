import React from 'react';

export default function TaskTableSkeleton() {
  return (
    <div className='w-full animate-pulse'>
      <table className='w-full'>
        <thead>
          <tr>
            {[...Array(7)].map((_, i) => (
              <th key={i} className='py-2 px-4 bg-gray-100'></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(6)].map((_, rowIdx) => (
            <tr key={rowIdx}>
              {[...Array(7)].map((_, colIdx) => (
                <td key={colIdx} className='py-3 px-4'>
                  <div className='h-4 bg-gray-200 rounded w-full'></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
