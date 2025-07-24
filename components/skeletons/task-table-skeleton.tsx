import React from 'react';

export default function TaskTableSkeleton() {
  return (
    <div className='w-full animate-pulse'>
      <table className='w-full'>
        <thead>
          <tr>
            {[...Array(10)].map((_, i) => (
              <th
                key={i}
                className='py-2 px-4 bg-gray-200 dark:bg-gray-600'
              ></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(9)].map((_, rowIdx) => (
            <tr key={rowIdx}>
              {[...Array(10)].map((_, colIdx) => (
                <td key={colIdx} className='py-3 px-4'>
                  <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded w-full'></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
