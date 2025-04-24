/* ------------------------------ AnalysisPieChart.js ------------------------------
Component: AnalysisPieChart

Overview:
  Renders a donut-style pie chart to visualize the proportion of completed
  versus incomplete assignments. Used in the Dashboard's analysis panel to give
  users a quick visual snapshot of their overall course progress.

Core Features:
  - Displays a two-segment donut chart (Completed vs Incomplete)
  - Renders the overall completion percentage in the center of the chart
  - Applies custom colors and tooltip formatting for visual clarity

Props:
  - completedCount (Number): Number of assignments the user has completed
  - totalCount (Number): Total number of assignments available

Dependencies:
  - recharts: Used for rendering the PieChart and its elements
  - react-bootstrap (indirect styling alignment)
  - AnalysisPieChart.css (optional, for additional scoped styling)

Styling:
  - Primary colors: green (#3fb950) for completed, light gray (#f0f0f0) for incomplete
  - Responsive container for adaptive sizing across viewports
----------------------------------------------------------------------------------- */

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import './styles/AnalysisPieChart.css'; 

// ------------------------------ Static color palette ------------------------------
// First color is used for completed portion, second for incomplete
const COLORS = ["#3fb950", "#f0f0f0"];


/* ------------------------------ AnalysisPieChart Component ------------------------------
   - Handles the conditional logic and rendering of the Recharts PieChart.
   - Calculates incomplete count from totalCount - completedCount.
   - Safely returns a fallback message if no data is available.
----------------------------------------------------------------------------------------- */
const AnalysisPieChart = ({ completedCount, totalCount }) => {
  if (!totalCount || totalCount === 0) return <p className="text-muted">No assignment data available.</p>;

  // Structure the data to be passed into the chart
  const data = [
    { name: 'Completed', value: completedCount },
    { name: 'Incomplete', value: totalCount - completedCount }
  ];

  return (
    <div className="analysis-chart-wrapper">
      <h5 className="text-center mt-2" style={{ color: '#fff' }}>Total Assignment Completion</h5>

      {/* ResponsiveContainer ensures the chart scales with its parent */}
      <ResponsiveContainer width="100%" height='100%'>
        <PieChart >
          {/* Donut chart configuration */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius='60%'
            outerRadius='100%'
            paddingAngle={2}
            dataKey="value"
            label={false}
            labelLine={false}
          >
            {/* Apply colors to pie segments */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          {/* Render completion percentage in center of the donut */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '1.2rem', fill: '#ffffff' }}
          >
            {`${Math.round((completedCount / totalCount) * 100)}%`}
          </text>

          {/* Tooltip styling for when user hovers on pie segments */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              borderRadius: 8
            }}
            formatter={(value, name) => [`${value}`, name]}
            isAnimationActive={true}
          />


        </PieChart>
      </ResponsiveContainer>
    </div>

  );
};

export default AnalysisPieChart;
