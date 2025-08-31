import React, { useState, useMemo, useEffect } from 'react';

type Status = 'Reported' | 'Not Reported' | 'Cancelled';

interface PollingUnitItem {
  name: string;
  status: Status;
  ward: string;
  lga: string;
}

interface PollingUnitStatusTableProps {
  pollingUnitsWithStatus: PollingUnitItem[];
}

const statusStyles: Record<Status, string> = {
    Reported: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Not Reported': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const PollingUnitStatusTable: React.FC<PollingUnitStatusTableProps> = ({ pollingUnitsWithStatus }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        setCurrentPage(1);
    }, [pollingUnitsWithStatus]);

    const { paginatedData, totalPages } = useMemo(() => {
        const total = Math.ceil(pollingUnitsWithStatus.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const data = pollingUnitsWithStatus.slice(startIndex, startIndex + itemsPerPage);
        return { paginatedData: data, totalPages: total };
    }, [pollingUnitsWithStatus, currentPage, itemsPerPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mt-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-gray-700 pb-2">Detailed Polling Unit Status ({pollingUnitsWithStatus.length} units)</h3>
            
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">S/N</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Polling Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ward</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">LGA</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((item, index) => {
                             const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                             return (
                                 <tr key={`${item.name}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{serialNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.ward}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.lga}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[item.status]}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
                 {paginatedData.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400">No polling units match the current filters.</div>}
            </div>
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Page {currentPage} of {totalPages}</span>
                    <div className="space-x-2">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Previous</button>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PollingUnitStatusTable;