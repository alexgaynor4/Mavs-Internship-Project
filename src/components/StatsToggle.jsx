// src/components/StatsToggle.jsx
import React, { useState, useMemo } from 'react';
import playersData from '../data/players.json';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
} from '@mui/material';

export default function StatsToggle({ playerId }) {
  const [viewMode, setViewMode] = useState('perGame');

  const seasons = useMemo(
    () => playersData.seasonLogs.filter(s => s.playerId === playerId),
    [playerId]
  );

  if (seasons.length === 0) {
    return <Typography sx={{ mt: 2 }}>No season stats available.</Typography>;
  }

  const data = seasons.map(s => {
    const gp = s.GP || 1;
    const mp = s.MP || 0;
    return {
      ...s,
      // Totals
      ptsTotal: Math.round(s.PTS * gp),
      trbTotal: Math.round(s.TRB * gp),
      astTotal: Math.round(s.AST * gp),
      fgmTotal: Math.round(s.FGM * gp),
      fgaTotal: Math.round(s.FGA * gp),
      tpmTotal: Math.round(s['3PM'] * gp),
      tpaTotal: Math.round(s['3PA'] * gp),
      ftmTotal: Math.round(s.FT * gp),
      ftaTotal: Math.round(s.FTA * gp),
      stlTotal: Math.round(s.STL * gp),
      blkTotal: Math.round(s.BLK * gp),

      // Per game
      ptsPerGame: s.PTS,
      trbPerGame: s.TRB,
      astPerGame: s.AST,
      fgmPerGame: s.FGM,
      fgaPerGame: s.FGA,
      tpmPerGame: s['3PM'],
      tpaPerGame: s['3PA'],
      ftmPerGame: s.FT,
      ftaPerGame: s.FTA,
      stlPerGame: s.STL,
      blkPerGame: s.BLK,

      // Per 36
      ptsPer36: mp ? (s.PTS / mp) * 36 : 0,
      trbPer36: mp ? (s.TRB / mp) * 36 : 0,
      astPer36: mp ? (s.AST / mp) * 36 : 0,
      fgmPer36: mp ? (s.FGM / mp) * 36 : 0,
      fgaPer36: mp ? (s.FGA / mp) * 36 : 0,
      tpmPer36: mp ? (s['3PM'] / mp) * 36 : 0,
      tpaPer36: mp ? (s['3PA'] / mp) * 36 : 0,
      ftmPer36: mp ? (s.FT / mp) * 36 : 0,
      ftaPer36: mp ? (s.FTA / mp) * 36 : 0,
      stlPer36: mp ? (s.STL / mp) * 36 : 0,
      blkPer36: mp ? (s.BLK / mp) * 36 : 0,
    };
  });

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <FormControl fullWidth>
        <InputLabel>View</InputLabel>
        <Select
          value={viewMode}
          label="View"
          onChange={e => setViewMode(e.target.value)}
        >
          <MenuItem value="perGame">Per Game</MenuItem>
          <MenuItem value="per36">Per 36 Minutes</MenuItem>
          <MenuItem value="totals">Totals</MenuItem>
        </Select>
      </FormControl>

      <TableContainer sx={{ maxHeight: 300, mt: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Season</TableCell>
              <TableCell>League</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>GP</TableCell>
              <TableCell>MP</TableCell>
              <TableCell>PTS</TableCell>
              <TableCell>FG</TableCell>
              <TableCell>FG%</TableCell>
              <TableCell>3P</TableCell>
              <TableCell>3P%</TableCell>
              <TableCell>FT</TableCell>
              <TableCell>FT%</TableCell>
              <TableCell>TRB</TableCell>
              <TableCell>AST</TableCell>
              <TableCell>STL</TableCell>
              <TableCell>BLK</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.Season}</TableCell>
                <TableCell>{row.League}</TableCell>
                <TableCell>{row.Team}</TableCell>
                <TableCell>{row.GP}</TableCell>
                <TableCell>{row.MP}</TableCell>

                {/* Points */}
                <TableCell>
                  {viewMode === 'perGame'
                    ? row.ptsPerGame.toFixed(1)
                    : viewMode === 'per36'
                    ? row.ptsPer36.toFixed(1)
                    : row.ptsTotal}
                </TableCell>

                {/* FG: no wrap */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {viewMode === 'perGame'
                    ? `${row.fgmPerGame.toFixed(1)}-${row.fgaPerGame.toFixed(1)}`
                    : viewMode === 'per36'
                    ? `${row.fgmPer36.toFixed(1)}-${row.fgaPer36.toFixed(1)}`
                    : `${row.fgmTotal}-${row.fgaTotal}`}
                </TableCell>

                <TableCell>{row['FG%']}</TableCell>

                {/* 3P: no wrap */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {viewMode === 'perGame'
                    ? `${row.tpmPerGame.toFixed(1)}-${row.tpaPerGame.toFixed(1)}`
                    : viewMode === 'per36'
                    ? `${row.tpmPer36.toFixed(1)}-${row.tpaPer36.toFixed(1)}`
                    : `${row.tpmTotal}-${row.tpaTotal}`}
                </TableCell>

                <TableCell>{row['3P%']}</TableCell>

                {/* FT: no wrap */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {viewMode === 'perGame'
                    ? `${row.ftmPerGame.toFixed(1)}-${row.ftaPerGame.toFixed(1)}`
                    : viewMode === 'per36'
                    ? `${row.ftmPer36.toFixed(1)}-${row.ftaPer36.toFixed(1)}`
                    : `${row.ftmTotal}-${row.ftaTotal}`}
                </TableCell>

                <TableCell>{row['FTP']}</TableCell>

                {/* TRB */}
                <TableCell>
                  {viewMode === 'perGame'
                    ? row.trbPerGame.toFixed(1)
                    : viewMode === 'per36'
                    ? row.trbPer36.toFixed(1)
                    : row.trbTotal}
                </TableCell>

                {/* AST */}
                <TableCell>
                  {viewMode === 'perGame'
                    ? row.astPerGame.toFixed(1)
                    : viewMode === 'per36'
                    ? row.astPer36.toFixed(1)
                    : row.astTotal}
                </TableCell>

                {/* STL */}
                <TableCell>
                  {viewMode === 'perGame'
                    ? row.stlPerGame.toFixed(1)
                    : viewMode === 'per36'
                    ? row.stlPer36.toFixed(1)
                    : row.stlTotal}
                </TableCell>

                {/* BLK */}
                <TableCell>
                  {viewMode === 'perGame'
                    ? row.blkPerGame.toFixed(1)
                    : viewMode === 'per36'
                    ? row.blkPer36.toFixed(1)
                    : row.blkTotal}
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
