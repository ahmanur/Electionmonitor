import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportingStatusData } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

const COLORS = ['#008753', '#dc3545'];

const ReportingStatusChart: React.FC = () => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#9CA3AF' : '#374151';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={reportingStatusData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {reportingStatusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#1F2937' : 'white',
            border: `1px solid ${theme === 'dark' ? '#4B5563' : '#ccc'}`,
            borderRadius: '5px'
          }}
        />
        <Legend wrapperStyle={{ color: textColor, fontSize: '14px' }}/>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ReportingStatusChart;