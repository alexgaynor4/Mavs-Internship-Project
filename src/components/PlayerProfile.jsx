// src/components/PlayerProfile.jsx
import React, { useState } from 'react';
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

  // Load from JSON
  const player = playersData.bio.find(p => p.playerId === id);
  const measure = playersData.measurements.find(m => m.playerId === id) || {};
  const initialReports = playersData.scoutingReports.filter(r => r.playerId === id);
  const gameLogs = playersData.game_logs.filter(g => g.playerId === id);

  // Local state
  const [tab, setTab] = useState(0);
  const [locationFilter, setLocationFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [reports, setReports] = useState(initialReports);

  if (!player) {
    return <Typography>Player not found</Typography>;
  }

  const handleTabChange = (_, newValue) => setTab(newValue);
  const isWin = g => (g.isHome ? g.homeTeamPts > g.visitorTeamPts : g.visitorTeamPts > g.homeTeamPts);

  // Add new report handler
  const handleAddReport = (text) => {
    const newReport = {
      scout: 'You',
      reportId: uuidv4(),
      playerId: id,
      report: text,
    };
    setReports(prev => [...prev, newReport]);
  };

  return (
    <Paper sx={{ mt: 3, p: 3 }}>
      {/* Header */}
      <Grid container spacing={2}>
        {player.photoUrl && (
          <Grid item>
            <Box
              component="img"
              src={player.photoUrl}
              alt={`${player.name} Headshot`}
              sx={{ height: 200, width: 'auto', borderRadius: 1 }}
            />
          </Grid>
        )}
        <Grid item xs>
          <Typography variant="h4">{player.name}</Typography>
          <Typography>{player.currentTeam} ({player.league})</Typography>
          <Typography sx={{ mt: 1 }}>
            Height: {measure.heightNoShoes
              ? `${Math.floor(measure.heightNoShoes/12)}' ${measure.heightNoShoes%12}"`
              : '-'} | Weight: {measure.weight || '-'} lbs
          </Typography>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 2 }}>
        <Tab label="Career Statistics" />
        <Tab label="Game Logs" />
        <Tab label="Scouting Reports" />
        <Tab label="Measurements" />
      </Tabs>

      {/* Career Stats */}
      {tab === 0 && <StatsToggle playerId={id} />}

      {/* Game Logs */}
      {tab === 1 && (
        <>
          <FormControl sx={{ mr: 2, minWidth: 120 }}>
            <InputLabel>Location</InputLabel>
            <Select
              value={locationFilter}
              label="Location"
              onChange={e => setLocationFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="home">Home</MenuItem>
              <MenuItem value="away">Away</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ mr: 2, minWidth: 120 }}>
            <InputLabel>Result</InputLabel>
            <Select
              value={resultFilter}
              label="Result"
              onChange={e => setResultFilter(e.target.value)}
            >
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
                  <TableCell>FG</TableCell>
                  <TableCell>FG%</TableCell>
                  <TableCell>3P</TableCell>
                  <TableCell>3P%</TableCell>
                  <TableCell>FT</TableCell>
                  <TableCell>REB</TableCell>
                  <TableCell>AST</TableCell>
                  <TableCell>BLK</TableCell>
                  <TableCell>STL</TableCell>
                  <TableCell>+/-</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gameLogs
                  .filter(g => {
                    if (locationFilter === 'home' && g.isHome !== 1) return false;
                    if (locationFilter === 'away' && g.isHome !== null) return false;
                    const win = isWin(g);
                    if (resultFilter === 'win' && !win) return false;
                    if (resultFilter === 'loss' && win) return false;
                    return true;
                  })
                  .map((g, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(g.date).toLocaleDateString()}</TableCell>
                      <TableCell>{g.isHome ? 'vs ' : 'at '}{g.opponent}</TableCell>
                      <TableCell>{isWin(g) ? 'W' : 'L'} {g.homeTeamPts}-{g.visitorTeamPts}</TableCell>
                      <TableCell>{g.timePlayed}</TableCell>
                      <TableCell>{g.pts}</TableCell>
                      <TableCell>{`${g.fgm}-${g.fga}`}</TableCell>
                      <TableCell>{g['fg%']}</TableCell>
                      <TableCell>{`${g.tpm}-${g.tpa}`}</TableCell>
                      <TableCell>{g['tp%']}</TableCell>
                      <TableCell>{`${g.ftm}-${g.fta}`}</TableCell>
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

      {/* Measurements */}
      {tab === 3 && <Measurements playerId={id} />}
    </Paper>
  );
}
