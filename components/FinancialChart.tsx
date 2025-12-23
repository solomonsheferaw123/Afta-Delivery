import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FinancialData } from '../types';

const data: FinancialData[] = [
  { year: 'Year 1', revenue: 150000, profitOrLoss: -120000 },
  { year: 'Year 2', revenue: 450000, profitOrLoss: -50000 },
  { year: 'Year 3', revenue: 900000, profitOrLoss: 100000 },
];

const FinancialChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-2">3-Year Financial Projection (USD)</h3>
      <p className="text-sm text-gray-500 mb-6">Projected growth from launch to profitability.</p>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280' }} 
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: '#f3f4f6' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Bar dataKey="revenue" name="Revenue" fill="#f97316" radius={[4, 4, 0, 0]} barSize={50} />
            <Bar dataKey="profitOrLoss" name="Net Income" fill="#1f2937" radius={[4, 4, 0, 0]} barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialChart;
