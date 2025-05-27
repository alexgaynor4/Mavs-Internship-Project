// src/components/StatsToggle.jsx
import React, { useState, useMemo } from 'react';
import playersData from '../data/players.json';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';

export default function StatsToggle({ playerId }) {
  const [mode, setMode] = useState('perGame');

  // get seasons
  const seasons = useMemo(
    () => playersData.seasonLogs.filter(s => s.playerId === playerId),
    [playerId]
  );

  if (!seasons.length) {
    return <Typography sx={{ mt: 2 }}>No season stats found.</Typography>;
  }

  // compute rows
  const rows = seasons.map(s => {
    const gp = s.GP || 1;
    const mp = s.MP || 0;

    const getValue = (raw) => {
      if (mode === 'perGame') return raw;
      if (mode === 'per36') return mp ? (raw / mp) * 36 : 0;
      // totals
      return Math.round(raw * gp);
    };

    const format = (val) => {
      return mode === 'totals' ? val : val.toFixed(1);
    };

    return {
      season: s.Season,
      league: s.League,
      team: s.Team,
      GP: s.GP,
      MP: s.MP,
      PTS: format(getValue(s.PTS)),
      FG: `${format(getValue(s.FGM))}-${format(getValue(s.FGA))}`,
      FGpct: s['FG%'],
      threeP: `${format(getValue(s['3PM']))}-${format(getValue(s['3PA']))}`,
      threePpct: s['3P%'],
      FT: `${format(getValue(s.FT))}-${format(getValue(s.FTA))}`,
      FTpct: s['FTP'],
      TRB: format(getValue(s.TRB)),
      AST: format(getValue(s.AST)),
      STL: format(getValue(s.STL)),
      BLK: format(getValue(s.BLK))
    };
  });

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <FormControl fullWidth>
        <InputLabel>View</InputLabel>
        <Select value={mode} onChange={e => setMode(e.target.value)}>
          <MenuItem value="perGame">Per Game</MenuItem>
          <MenuItem value="per36">Per 36</MenuItem>
          <MenuItem value="totals">Totals</MenuItem>
        </Select>
      </FormControl>
      <TableContainer sx={{ maxHeight: 300, mt: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {['Season','League','Team','GP','MP','PTS','FG','FG%','3P','3P%','FT','FT%','TRB','AST','STL','BLK'].map(h => (
                <TableCell
                  key={h}
                  sx={{ whiteSpace: /FG|3P|FT/.test(h) ? 'nowrap' : 'normal' }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.season}</TableCell>
                <TableCell>{r.league}</TableCell>
                <TableCell>{r.team}</TableCell>
                <TableCell>{r.GP}</TableCell>
                <TableCell>{r.MP}</TableCell>
                <TableCell>{r.PTS}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.FG}</TableCell>
                <TableCell>{r.FGpct}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.threeP}</TableCell>
                <TableCell>{r.threePpct}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.FT}</TableCell>
                <TableCell>{r.FTpct}</TableCell>
                <TableCell>{r.TRB}</TableCell>
                <TableCell>{r.AST}</TableCell>
                <TableCell>{r.STL}</TableCell>
                <TableCell>{r.BLK}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
