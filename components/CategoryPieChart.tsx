
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatting';

interface CategoryPieChartProps {
  data: { name: string; value: number }[];
  currency: string;
}

const COLORS = ['#84cc16', '#facc15', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#d946ef'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  currency: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
        <p className="font-semibold">{`${data.name}`}</p>
        <p className="text-primary-500">{`Amount: ${formatCurrency(data.value, currency)}`}</p>
        <p className="text-gray-500">{`(${(data.percent * 100).toFixed(2)}%)`}</p>
      </div>
    );
  }

  return null;
};

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, currency }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
