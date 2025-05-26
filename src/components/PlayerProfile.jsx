// src/components/PlayerProfile.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import playersData from '../data/players.json';
import StatsToggle from './StatsToggle';
import ReportForm from './ReportForm';
import Measurements from './Measurements';

export default function PlayerProfile() {
  const { playerId } = useParams();
  const id = parseInt(playerId, 10);

  const player = playersData.bio.find(p => p.playerId === id);
  const measure = playersData.measurements.find(m => m.playerId === id) || {};
  const initialReports = playersData.scoutingReports.filter(r => r.playerId === id);
  const gameLogs = playersData.game_logs.filter(g => g.playerId === id);
  const seasonLogs = playersData.seasonLogs.filter(s => s.playerId === id);

  const [tab, setTab] = useState(0);
  const [locationFilter, setLocationFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [reports, setReports] = useState(initialReports);
  const [compareId, setCompareId] = useState('');

  if (!player) return <Typography>Player not found</Typography>;

  const handleTabChange = (_, newValue) => setTab(newValue);
  const isWin = g => (g.isHome ? g.homeTeamPts > g.visitorTeamPts : g.visitorTeamPts > g.homeTeamPts);
  const handleAddReport = text => setReports(prev => [...prev, { scout: 'You', reportId: uuidv4(), playerId: id, report: text }]);

  const getBestSeason = useCallback((logs) => {
    if (!Array.isArray(logs) || logs.length === 0) return null;
    return logs.reduce((best, cur) => (cur.GP > best.GP ? cur : best), logs[0]);
  }, []);

  const mySeason = useMemo(() => getBestSeason(seasonLogs), [seasonLogs, getBestSeason]);
  const compareSeason = useMemo(() => {
    if (!compareId) return null;
    const otherLogs = playersData.seasonLogs.filter(s => s.playerId === parseInt(compareId, 10));
    return getBestSeason(otherLogs);
  }, [compareId, getBestSeason]);

  const compareFields = [
    { key: 'PTS', label: 'PTS/G' },
    { key: 'TRB', label: 'REB/G' },
    { key: 'AST', label: 'AST/G' },
    { key: 'STL', label: 'STL/G' },
    { key: 'BLK', label: 'BLK/G' },
    { key: 'FG%', label: 'FG%' },
    { key: '3P%', label: '3P%' },
    { key: 'FTP', label: 'FT%' },
  ];

  return (
    <Paper sx={{ mt: 3, p: 3 }}>
      {/* Header */}
      <Grid container spacing={2}>
        {player.photoUrl && (
          <Grid item>
            <Box component="img" src={player.photoUrl} alt={player.name} sx={{ height: 200, borderRadius: 1 }} />
          </Grid>
        )}
        <Grid item xs>
          <Typography variant="h4">{player.name}</Typography>
          <Typography>{player.currentTeam} ({player.league})</Typography>
          <Typography sx={{ mt: 1 }}>
            Height: {measure.heightNoShoes ? `${Math.floor(measure.heightNoShoes/12)}' ${measure.heightNoShoes%12}"` : '-'} | Weight: {measure.weight ?? '-'} lbs
          </Typography>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ mt: 2 }}>
        <Tab label="Career Statistics" />
        <Tab label="Game Logs" />
        <Tab label="Scouting Reports" />
        <Tab label="Comparisons" />
        <Tab label="Measurements" />
      </Tabs>

      {/* Career Stats */}
      {tab === 0 && <StatsToggle playerId={id} />}

      {/* Game Logs */}
      {tab === 1 && (
        <>
          <FormControl sx={{ mr: 2, minWidth: 120, mt: 2 }}>
            <InputLabel>Location</InputLabel>
            <Select value={locationFilter} label="Location" onChange={e => setLocationFilter(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="home">Home</MenuItem>
              <MenuItem value="away">Away</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ mr: 2, minWidth: 120, mt: 2 }}>
            <InputLabel>Result</InputLabel>
            <Select value={resultFilter} label="Result" onChange={e => setResultFilter(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="win">Win</MenuItem>
              <MenuItem value="loss">Loss</MenuItem>
            </Select>
          </FormControl>

          <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Opponent</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>MP</TableCell>
                  <TableCell>PTS</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>FG</TableCell>
                  <TableCell>FG%</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>3P</TableCell>
                  <TableCell>3P%</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>FT</TableCell>
                  <TableCell>FT%</TableCell>
                  <TableCell>REB</TableCell>
                  <TableCell>AST</TableCell>
                  <TableCell>BLK</TableCell>
                  <TableCell>STL</TableCell>
                  <TableCell>+/-</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gameLogs.filter(g => {
                  if (locationFilter === 'home' && g.isHome !== 1) return false;
                  if (locationFilter === 'away' && g.isHome !== 0) return false;
                  const win = isWin(g);
                  if (resultFilter === 'win' && !win) return false;
                  if (resultFilter === 'loss' && win) return false;
                  return true;
                }).map((g, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(g.date).toLocaleDateString()}</TableCell>
                    <TableCell>{g.isHome ? 'vs ' : 'at '}{g.opponent}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{isWin(g) ? 'W' : 'L'} {g.homeTeamPts}-{g.visitorTeamPts}</TableCell>
                    <TableCell>{g.timePlayed}</TableCell>
                    <TableCell>{g.pts}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${g.fgm}-${g.fga}`}</TableCell>
                    <TableCell>{g['fg%']}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${g.tpm}-${g.tpa}`}</TableCell>
                    <TableCell>{g['tp%']}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${g.ftm}-${g.fta}`}</TableCell>
                    <TableCell>{g['ft%']}</TableCell>
                    <TableCell>{g.reb}</TableCell>
                    <TableCell>{g.ast}</TableCell>
                    <TableCell>{g.blk}</TableCell>
                    <TableCell>{g.stl}</TableCell>
                    <TableCell>{g.plusMinus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Scouting Reports */}
      {tab === 2 && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">Scouting Reports</Typography>
          <List>
            {reports.map(r => (
              <ListItem key={r.reportId} alignItems="flex-start">
                <ListItemText primary={r.scout} secondary={r.report} />
              </ListItem>
            ))}
          </List>
          <ReportForm onAdd={handleAddReport} />
        </Paper>
      )}

      {/* Comparisons */}
      {tab === 3 && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">Compare to...</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Player</InputLabel>
            <Select value={compareId} label="Player" onChange={e => setCompareId(e.target.value)}>
              <MenuItem value="">Select...</MenuItem>
              {playersData.bio.filter(p => p.playerId !== id).map(p => (
                <MenuItem key={p.playerId} value={p.playerId}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {compareId && mySeason && compareSeason && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">{player.name}</TableCell>
                    <TableCell align="center">Stat</TableCell>
                    <TableCell align="center">{playersData.bio.find(p => p.playerId === parseInt(compareId, 10))?.name}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {compareFields.map(f => {
                    const aRaw = mySeason?.[f.key];
                    const bRaw = compareSeason?.[f.key];
                    const a = typeof aRaw === 'number' ? aRaw : null;
                    const b = typeof bRaw === 'number' ? bRaw : null;
                    const highlightA = a !== null && b !== null && a > b;
                    const highlightB = a !== null && b !== null && b > a;
                    return (
                      <TableRow key={f.key}>
                        <TableCell align="center" sx={{ backgroundColor: highlightA ? 'rgba(144,238,144,0.5)' : 'transparent', fontWeight: highlightA ? 'bold' : 'normal' }}>{a !== null ? a.toFixed(1) : '-'}</TableCell>
                        <TableCell align="center">{f.label}</TableCell>
                        <TableCell align="center" sx={{ backgroundColor: highlightB ? 'rgba(144,238,144,0.5)' : 'transparent', fontWeight: highlightB ? 'bold' : 'normal' }}>{b !== null ? b.toFixed(1) : '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Measurements */}
      {tab === 4 && <Measurements playerId={id} />}
    </Paper>
  );
}
