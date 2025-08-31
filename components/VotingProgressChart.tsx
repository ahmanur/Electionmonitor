import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { votingProgressData } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

const VotingProgressChart: React.FC = () => {
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#9CA3AF' : '#374151';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={votingProgressData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: tickColor }} />
                <YAxis
                    tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value as number)}
                    tick={{ fontSize: 12, fill: tickColor }}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(107, 114, 128, 0.2)' }}
                    contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : 'white',
                        border: `1px solid ${theme === 'dark' ? '#4B5563' : '#ccc'}`,
                        borderRadius: '5px'
                    }}
                    formatter={(value: number) => new Intl.NumberFormat().format(value) + ' votes'}
                />
                <Bar dataKey="votes" fill="#008753" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default VotingProgressChart;
