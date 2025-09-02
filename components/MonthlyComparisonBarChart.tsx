
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatting';

interface MonthlyComparisonBarChartProps {
  data: { name: string; income: number; expenses: number }[];
  currency: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
        <p className="label font-bold">{`${label}`}</p>
        <p className="text-green-500">{`Income: ${formatCurrency(payload[0].value, currency)}`}</p>
        <p className="text-red-500">{`Expenses: ${formatCurrency(payload[1].value, currency)}`}</p>
      </div>
    );
  }
  return null;
};


const MonthlyComparisonBarChart: React.FC<MonthlyComparisonBarChartProps> = ({ data, currency }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis tickFormatter={(value) => formatCurrency(value as number, currency)} className="text-xs" />
          <Tooltip content={<CustomTooltip currency={currency} />}/>
          <Legend />
          <Bar dataKey="income" fill="#84cc16" />
          <Bar dataKey="expenses" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyComparisonBarChart;
