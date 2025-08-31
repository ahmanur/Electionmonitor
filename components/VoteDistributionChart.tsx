import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import type { Result, Candidate } from '../types';

const COLORS = ['#008753', '#dc3545', '#6f42c1', '#fd7e14'];

interface VoteDistributionChartProps {
  results: Result[];
  candidates: Candidate[];
}

const VoteDistributionChart: React.FC<VoteDistributionChartProps> = ({ results, candidates }) => {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#9CA3AF' : '#374151';

  const { chartData, totalVotes } = useMemo(() => {
    if (!results || !candidates) {
        return { chartData: [], totalVotes: 0 };
    }

    const candidateTotals = candidates.reduce((acc, candidate) => {
        acc[candidate.id] = { name: candidate.name, party: candidate.party, votes: 0 };
        return acc;
    }, {} as Record<string, { name: string, party: string, votes: number }>);
    
    results.forEach(result => {
        result.candidateScores.forEach(score => {
            if (candidateTotals[score.candidateId]) {
                candidateTotals[score.candidateId].votes += score.score;
            }
        });
    });

    const data = Object.values(candidateTotals).sort((a, b) => b.votes - a.votes);
    const total = data.reduce((sum, current) => sum + current.votes, 0);

    return { chartData: data, totalVotes: total };
  }, [results, candidates]);

  if (!chartData || chartData.length === 0) {
      return (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No result data available.
          </div>
      );
  }

  const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
          const data = payload[0].payload;
          const percentage = totalVotes > 0 ? ((data.votes / totalVotes) * 100).toFixed(2) : 0;
          return (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border dark:border-gray-600">
                  <p className="font-bold text-gray-800 dark:text-gray-100">{`${data.name}`}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{`${data.party}`}</p>
                  <p className="text-sm text-primary-green font-semibold">{`Votes: ${data.votes.toLocaleString()}`}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{`(${percentage}%)`}</p>
              </div>
          );
      }
      return null;
  };

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === 0) return null;
    return (
        <text x={x + width / 2} y={y} dy={-4} fill={tickColor} fontSize={12} textAnchor="middle">
            {value.toLocaleString()}
        </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} />
        <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US').format(value as number)} tick={{ fontSize: 12, fill: tickColor }} />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(107, 114, 128, 0.2)' }}
        />
        <Bar dataKey="votes">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <LabelList dataKey="votes" content={renderCustomizedLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VoteDistributionChart;