import React, { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import playersData from '../data/players.json';
import StatsToggle from './StatsToggle';
import ReportForm from './ReportForm';
import Measurements from './Measurements';

export default function PlayerProfile() {
  const { playerId } = useParams();
  const id = Number(playerId);

  // load player and related data
  const player = playersData.bio.find(p => p.playerId === id);
  const measure = playersData.measurements.find(m => m.playerId === id) || {};
  const logs = playersData.game_logs.filter(g => g.playerId === id);
  const reportsInit = playersData.scoutingReports.filter(r => r.playerId === id);
  const seasons = playersData.seasonLogs.filter(s => s.playerId === id);

  // UI state
  const [tab, setTab] = useState(0);
  const [loc, setLoc] = useState('all');
  const [res, setRes] = useState('all');
  const [reports, setReports] = useState(reportsInit);
  const [compareId, setCompareId] = useState('');

  if (!player) return <Typography>Player not found</Typography>;

  // check win/loss
  function isWin(g) {
    return g.isHome ? g.homeTeamPts > g.visitorTeamPts : g.visitorTeamPts > g.homeTeamPts;
  }

  // add report
  function addReport(text) {
    const newR = { scout: 'You', reportId: uuidv4(), playerId: id, report: text };
    setReports(prev => [...prev, newR]);
  }

  // pick season with most games
  const getBest = useCallback(arr => {
    return arr.length ? arr.reduce((a, b) => (b.GP > a.GP ? b : a), arr[0]) : null;
  }, []);

  const mySeason = useMemo(() => getBest(seasons), [seasons, getBest]);
  const otherSeason = useMemo(() => {
    if (!compareId) return null;
    const arr = playersData.seasonLogs.filter(s => s.playerId === Number(compareId));
    return getBest(arr);
  }, [compareId, getBest]);

  const fields = [
    { key: 'PTS', label: 'PTS/G' },
    { key: 'TRB', label: 'REB/G' },
    { key: 'AST', label: 'AST/G' },
    { key: 'STL', label: 'STL/G' },
    { key: 'BLK', label: 'BLK/G' },
    { key: 'FG%', label: 'FG%' },
    { key: '3P%', label: '3P%' },
    { key: 'FTP', label: 'FT%' }
  ];

  return (
    <Paper style={{ margin: 16, padding: 16 }}>
      <Grid container spacing={2}>
        {player.photoUrl && (
          <Grid item>
            <Box component="img" src={player.photoUrl} alt={player.name} style={{ height: 200 }} />
          </Grid>
        )}
        <Grid item xs>
          <Typography variant="h4">{player.name}</Typography>
          <Typography>{player.currentTeam} ({player.league})</Typography>
          <Typography>
            Height: {measure.heightNoShoes ? `${Math.floor(measure.heightNoShoes/12)}' ${measure.heightNoShoes%12}"` : '-'} |
            Weight: {measure.weight ?? '-'} lbs
          </Typography>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} style={{ marginTop: 16 }}>
        <Tab label="Career Stats" />
        <Tab label="Game Logs" />
        <Tab label="Reports" />
        <Tab label="Compare" />
        <Tab label="Measurements" />
      </Tabs>

      {tab === 0 && <StatsToggle playerId={id} />}

      {tab === 1 && (
        <>
          <FormControl style={{ marginRight: 16, minWidth: 120, marginTop: 16 }}>
            <InputLabel>Location</InputLabel>
            <Select value={loc} onChange={e => setLoc(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="home">Home</MenuItem>
              <MenuItem value="away">Away</MenuItem>
            </Select>
          </FormControl>
          <FormControl style={{ marginRight: 16, minWidth: 120, marginTop: 16 }}>
            <InputLabel>Result</InputLabel>
            <Select value={res} onChange={e => setRes(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="win">Win</MenuItem>
              <MenuItem value="loss">Loss</MenuItem>
            </Select>
          </FormControl>

          <TableContainer component={Paper} style={{ marginTop: 16, maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {['Date','Opponent','Result','MP','PTS','FG','FG%','3P','3P%','FT','FT%','REB','AST','BLK','STL','+/-'].map(h => (
                    <TableCell key={h} style={{ whiteSpace: h==='FG'||h==='3P'||h==='FT' ? 'nowrap': 'normal' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.filter(g => {
                  if (loc==='home'&&g.isHome!==1) return false;
                  if (loc==='away'&&g.isHome!==null) return false;
                  const winFlag = isWin(g);
                  if (res==='win'&&!winFlag) return false;
                  if (res==='loss'&&winFlag) return false;
                  return true;
                }).map((g,i)=>(
                  <TableRow key={i}>
                    <TableCell>{new Date(g.date).toLocaleDateString()}</TableCell>
                    <TableCell>{g.isHome?'vs ':'at '}{g.opponent}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{isWin(g)?'W':'L'} {g.homeTeamPts}-{g.visitorTeamPts}</TableCell>
                    <TableCell>{g.timePlayed}</TableCell>
                    <TableCell>{g.pts}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{`${g.fgm}-${g.fga}`}</TableCell>
                    <TableCell>{g['fg%']}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{`${g.tpm}-${g.tpa}`}</TableCell>
                    <TableCell>{g['tp%']}</TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{`${g.ftm}-${g.fta}`}</TableCell>
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

      {tab === 2 && (
        <Paper style={{ marginTop: 16, padding: 16 }}>
          <Typography variant="h6">Scouting Reports</Typography>
          <List>
            {reports.map(r=> (
              <ListItem key={r.reportId}>
                <ListItemText primary={r.scout} secondary={r.report} />
              </ListItem>
            ))}
          </List>
          <ReportForm onAdd={addReport} />
        </Paper>
      )}

      {tab === 3 && (
        <Paper style={{ marginTop: 16, padding: 16 }}>
          <Typography variant="h6">Compare Seasons</Typography>
          <FormControl fullWidth style={{ marginBottom: 16 }}>
            <InputLabel>Select Player</InputLabel>
            <Select value={compareId} onChange={e=>setCompareId(e.target.value)}>
              <MenuItem value="">-- choose --</MenuItem>
              {playersData.bio.filter(p=>p.playerId!==id).map(p=> (
                <MenuItem key={p.playerId} value={p.playerId}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {compareId && mySeason && otherSeason && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">{player.name}</TableCell>
                    <TableCell align="center">Stat</TableCell>
                    <TableCell align="center">{playersData.bio.find(p=>p.playerId===Number(compareId))?.name}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map(f=>{
                    const a = typeof mySeason[f.key]==='number'?mySeason[f.key]:null;
                    const b = typeof otherSeason[f.key]==='number'?otherSeason[f.key]:null;
                    const aWin = a!=null && b!=null && a>b;
                    const bWin = a!=null && b!=null && b>a;
                    return (
                      <TableRow key={f.key}>
                        <TableCell align="center" style={{ backgroundColor: aWin?'#c8e6c9':'transparent', fontWeight:aWin?'bold':'normal'}}>
                          {a!=null? a.toFixed(1): '-'}
                        </TableCell>
                        <TableCell align="center">{f.label}</TableCell>
                        <TableCell align="center" style={{ backgroundColor: bWin?'#c8e6c9':'transparent', fontWeight:bWin?'bold':'normal'}}>
                          {b!=null? b.toFixed(1): '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {tab === 4 && <Measurements playerId={id} />}
    </Paper>
  );
}
