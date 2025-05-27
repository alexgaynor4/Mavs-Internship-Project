import React, { useMemo } from 'react';
import playersData from '../data/players.json';
import { Paper, Typography } from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

// simple percentile function
function percentileRank(arr, value) {
  const clean = arr.filter(v => v != null && !isNaN(v)).sort((a, b) => a - b);
  if (!clean.length) return { percentile: 0, countLE: 0, total: 0 };
  const countLE = clean.filter(v => v <= value).length;
  return { percentile: (countLE / clean.length) * 100, countLE, total: clean.length };
}

export default function Measurements({ playerId }) {
  const m = useMemo(
    () => playersData.measurements.find(x => x.playerId === playerId),
    [playerId]
  );
  if (!m) return <Typography sx={{ mt: 2 }}>No measurements available.</Typography>;

  // define metrics, labels, units, and invert flag for times
  const metrics = [
    { key: 'heightNoShoes', label: 'Height', unit: 'in' },
    { key: 'wingspan', label: 'Wingspan', unit: 'in' },
    { key: 'maxVertical', label: 'Max Vertical', unit: 'in' },
    { key: 'weight', label: 'Weight', unit: 'lbs' },
    { key: 'handSize', label: 'Hand Size', unit: 'in' },
    { key: 'agility', label: 'Agility', unit: 'sec', invert: true },
    { key: 'sprint', label: 'Sprint', unit: 'sec', invert: true },
    { key: 'shuttleBest', label: 'Shuttle', unit: 'sec', invert: true },
  ];

  // prepare distributions
  const all = playersData.measurements;
  const dists = useMemo(() => {
    const o = {};
    metrics.forEach(met => {
      if (met.key === 'handSize') {
        o.handLength = all.map(x => x.handLength).filter(v => v != null);
        o.handWidth = all.map(x => x.handWidth).filter(v => v != null);
      } else {
        o[met.key] = all.map(x => x[met.key]).filter(v => v != null);
      }
    });
    return o;
  }, []);

  // build chart data
  const data = useMemo(() => {
    const arr = [];
    metrics.forEach(met => {
      let raw;
      let distArr;
      if (met.key === 'handSize') {
        raw = (m.handLength + m.handWidth) / 2;
        distArr = [...dists.handLength, ...dists.handWidth];
      } else {
        raw = m[met.key];
        distArr = dists[met.key] || [];
      }
      if (raw == null || !distArr.length) return;
      const { percentile, countLE, total } = percentileRank(distArr, raw);
      const value = met.invert
        ? parseFloat((100 - percentile).toFixed(1))
        : parseFloat(percentile.toFixed(1));
      const rank = met.invert ? countLE : total - countLE + 1;
      arr.push({
        metric: met.label,
        value,
        raw,
        rank,
        total,
        unit: met.unit,
      });
    });
    return arr;
  }, [m, dists]);

  return (
    <Paper sx={{ mt: 2, p: 2, height: 400 }}>
      <Typography variant="h6">Measurements</Typography>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis domain={[0, 100]} tickCount={6} />
          <Radar name="Percentile" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <RechartsTooltip
            tooltipType="axis"
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const e = payload[0].payload;
                return (
                  <Paper sx={{ p: 1, backgroundColor: 'white' }} elevation={3}>
                    <Typography variant="subtitle2">{e.metric}</Typography>
                    <Typography variant="body2">Value: {e.raw} {e.unit}</Typography>
                    <Typography variant="body2">Percentile: {e.value}%</Typography>
                    <Typography variant="body2">Rank: {e.rank} / {e.total}</Typography>
                  </Paper>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Paper>
  );
}