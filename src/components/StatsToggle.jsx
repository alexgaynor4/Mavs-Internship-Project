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

  if (!seasons.length) {
    return <Typography sx={{ mt: 2 }}>No season stats available.</Typography>;
  }

  const data = seasons.map(s => {
    const gp = s.GP || 1;
    const mp = s.MP || 0;
    const ptsPerGame = s.PTS || 0;
    const trbPerGame = s.TRB || 0;
    const astPerGame = s.AST || 0;
    const ptsTotal = Math.round(ptsPerGame * gp);
    const trbTotal = Math.round(trbPerGame * gp);
    const astTotal = Math.round(astPerGame * gp);
    const ptsPer36 = mp ? (ptsPerGame / mp) * 36 : 0;
    const trbPer36 = mp ? (trbPerGame / mp) * 36 : 0;
    const astPer36 = mp ? (astPerGame / mp) * 36 : 0;
    return {
      ...s,
      ptsTotal,
      trbTotal,
      astTotal,
      ptsPerGame,
      trbPerGame,
      astPerGame,
      ptsPer36,
      trbPer36,
      astPer36,
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
              <TableCell>FG%</TableCell>
              <TableCell>3P%</TableCell>
              <TableCell>TRB</TableCell>
              <TableCell>AST</TableCell>
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
                <TableCell>
                  {viewMode === 'perGame'
                    ? row.ptsPerGame.toFixed(1)
                    : viewMode === 'per36'
                    ? row.ptsPer36.toFixed(1)
                    : row.ptsTotal}
                </TableCell>
                <TableCell>{row['FG%']}</TableCell>
                <TableCell>{row['3P%']}</TableCell>
                <TableCell>
                  {viewMode === 'perGame'
                    ? row.trbPerGame.toFixed(1)
                    : viewMode === 'per36'
                    ? row.trbPer36.toFixed(1)
                    : row.trbTotal}
                </TableCell>
                <TableCell>
                  {viewMode === 'perGame'
                    ? row.astPerGame.toFixed(1)
                    : viewMode === 'per36'
                    ? row.astPer36.toFixed(1)
                    : row.astTotal}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}