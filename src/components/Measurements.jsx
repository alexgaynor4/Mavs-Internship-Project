// src/components/Measurements.jsx
import React, { useMemo } from 'react';
import playersData from '../data/players.json';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { Paper, Typography } from '@mui/material';

// Helper: compute percentile rank of value within array
const percentileRank = (arr, value) => {
  if (arr.length === 0) return { percentile: 0, countLE: 0, total: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const countLE = sorted.filter(v => v <= value).length;
  return { percentile: (countLE / sorted.length) * 100, countLE, total: sorted.length };
};

// Units mapping for tooltip only
const unitMap = {
  heightNoShoes: 'ins',
  wingspan: 'ins',
  maxVertical: 'ins',
  weight: 'lbs',
  handLength: 'ins',
  handWidth: 'ins',
  agility: 'sec',
  sprint: 'sec',
  shuttleBest: 'sec',
};

// Custom tooltip for radar chart, triggers on both item and axis hover
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    return (
      <Paper sx={{ p: 1, backgroundColor: 'white' }} elevation={3}>
        <Typography variant="subtitle2">{entry.metric}</Typography>
        <Typography variant="body2">
          Value: {entry.raw} {entry.unit}
        </Typography>
        <Typography variant="body2">Percentile: {entry.value}%</Typography>
        <Typography variant="body2">
          Rank: {entry.rank} / {entry.total}
        </Typography>
      </Paper>
    );
  }
  return null;
};

export default function Measurements({ playerId }) {
  const measurements = useMemo(
    () => playersData.measurements.find(x => x.playerId === playerId),
    [playerId]
  );

  const distributions = useMemo(() => {
    const all = playersData.measurements;
    const metrics = [
      'heightNoShoes',
      'wingspan',
      'maxVertical',
      'weight',
      'handLength',
      'handWidth',
      'agility',
      'sprint',
      'shuttleBest',
    ];
    return metrics.reduce((acc, key) => {
      acc[key] = all.map(m => m[key]).filter(v => v != null && !isNaN(v));
      return acc;
    }, {});
  }, []);

  if (!measurements) {
    return <Typography sx={{ mt: 2 }}>No measurements available.</Typography>;
  }

  const timedKeys = ['agility', 'sprint', 'shuttleBest'];

  const data = useMemo(() => {
    const arr = [];
    const m = measurements;
    const addMetric = (label, key, invert = false) => {
      const raw = m[key];
      const dist = distributions[key] || [];
      if (raw != null && dist.length) {
        const { percentile, countLE, total } = percentileRank(dist, raw);
        const pctValue = invert
          ? parseFloat((100 - percentile).toFixed(1))
          : parseFloat(percentile.toFixed(1));
        const rank = invert ? countLE : total - countLE + 1;
        arr.push({
          metric: label,
          value: pctValue,
          raw,
          rank,
          total,
          unit: unitMap[key] || '',
        });
      }
    };

    addMetric('Height', 'heightNoShoes');
    addMetric('Wingspan', 'wingspan');
    addMetric('Max Vertical', 'maxVertical');
    addMetric('Weight', 'weight');

    if (m.handLength != null && m.handWidth != null) {
      const raw = (m.handLength + m.handWidth) / 2;
      const combined = [...distributions.handLength, ...distributions.handWidth];
      const { percentile, countLE, total } = percentileRank(combined, raw);
      const pctValue = parseFloat(percentile.toFixed(1));
      const rank = total - countLE + 1;
      arr.push({
        metric: 'Hand Size',
        value: pctValue,
        raw,
        rank,
        total,
        unit: 'ins',
      });
    } else {
      addMetric('Hand Length', 'handLength');
      addMetric('Hand Width', 'handWidth');
    }

    addMetric('Agility', 'agility', true);
    addMetric('Sprint', 'sprint', true);
    addMetric('Shuttle', 'shuttleBest', true);

    return arr;
  }, [measurements, distributions]);

  return (
    <Paper sx={{ mt: 2, p: 2, height: 400 }}>
      <Typography variant="h6">Measurements</Typography>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis domain={[0, 100]} tickCount={6} />
          <Radar
            name="Percentile"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          {/* Show tooltip on axis label hover too */}
          <RechartsTooltip content={<CustomTooltip />} tooltipType="axis" />
        </RadarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
