import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import type { Result, Candidate } from '../types';

const COLORS = ['#008753', '#dc3545', '#6f42c1', '#fd7e14', '#FFC107', '#2196F3'];

interface LgaVoteDistributionChartProps {
    results: Result[];
    candidates: Candidate[];
}

const LgaVoteDistributionChart: React.FC<LgaVoteDistributionChartProps> = ({ results, candidates }) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#9CA3AF' : '#374151';
  const [selectedLga, setSelectedLga] = useState('All');

  const { chartData, uniqueLgas, totalVotes } = useMemo(() => {
    const lgas = [...new Set(results.map(r => r.lga))];

    const filteredResults = selectedLga === 'All' 
        ? results 
        : results.filter(r => r.lga === selectedLga);

    if (filteredResults.length === 0) {
        return { chartData: [], uniqueLgas: lgas, totalVotes: 0 };
    }

    const candidateTotals = candidates.reduce((acc, candidate) => {
        acc[candidate.id] = { name: candidate.name, votes: 0 };
        return acc;
    }, {} as Record<string, { name: string; votes: number }>);
    
    let total = 0;
    filteredResults.forEach(result => {
        result.candidateScores.forEach(score => {
            if (candidateTotals[score.candidateId]) {
                candidateTotals[score.candidateId].votes += score.score;
                total += score.score;
            }
        });
    });

    const data = Object.values(candidateTotals)
        .filter(c => c.votes > 0)
        .sort((a, b) => b.votes - a.votes);

    return { chartData: data, uniqueLgas: lgas, totalVotes: total };
  }, [results, candidates, selectedLga]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const percentage = totalVotes > 0 ? ((data.votes / totalVotes) * 100).toFixed(2) : 0;
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border dark:border-gray-600">
                <p className="font-bold text-gray-800 dark:text-gray-100">{`${data.name}`}</p>
                <p className="text-sm text-primary-green font-semibold">{`Votes: ${data.votes.toLocaleString()}`}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{`(${percentage}%)`}</p>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
        <div className="mb-2">
            <label htmlFor="lga-chart-filter" className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">
                Filter by LGA:
            </label>
            <select 
                id="lga-chart-filter"
                value={selectedLga} 
                onChange={(e) => setSelectedLga(e.target.value)} 
                className="p-1.5 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-green focus:border-primary-green"
            >
                <option value="All">All LGAs</option>
                {uniqueLgas.sort().map(lga => <option key={lga} value={lga}>{lga}</option>)}
            </select>
        </div>
        {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votes"
                    nameKey="name"
                    label={({ percent, name }) => `${(name.split(' ').pop() || '')} ${(percent * 100).toFixed(0)}%`}
                    >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: textColor, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                </PieChart>
            </ResponsiveContainer>
        ) : (
             <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No result data for {selectedLga}.
            </div>
        )}
    </div>
  );
};

export default LgaVoteDistributionChart;
