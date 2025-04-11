import React from 'react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Common data type
type DataType = {
  name: string;
  value: number;
};

// Props for line and bar charts
type ChartProps = {
  data: DataType[];
  color?: string;
  height?: number;
  showAxis?: boolean;
};

// Props for pie chart
type PieChartProps = {
  data: DataType[];
  height?: number;
  colors?: string[];
};

export const LineChart: React.FC<ChartProps> = ({
  data,
  color = '#8884d8',
  height = 200,
  showAxis = true,
}) => (
  <div style={{ width: '100%', height }}>
    <ResponsiveContainer width="100%" height="100%">
      <ReLineChart data={data}>
        <Tooltip />
        {showAxis && <XAxis dataKey="name" />}
        {showAxis && <YAxis />}
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} />
      </ReLineChart>
    </ResponsiveContainer>
  </div>
);

export const BarChart: React.FC<ChartProps> = ({
  data,
  color = '#82ca9d',
  height = 200,
  showAxis = true,
}) => (
  <div style={{ width: '100%', height }}>
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data}>
        <Tooltip />
        {showAxis && <XAxis dataKey="name" />}
        {showAxis && <YAxis />}
        <Bar dataKey="value" fill={color} />
      </ReBarChart>
    </ResponsiveContainer>
  </div>
);

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 200,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
}) => (
  <div style={{ width: '100%', height }}>
    <ResponsiveContainer width="100%" height="100%">
      <RePieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={70}
          fill="#8884d8"
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  </div>
);
