import React from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import StatsToggle from './StatsToggle';
import ReportForm from './ReportForm';
import playersData from '../data/players.json';

export default function PlayerProfile() {
  const { playerId } = useParams();
  const id = parseInt(playerId, 10);
  const { bio, scoutRankings, measurements } = playersData;
  const player = bio.find(p => p.playerId === id);
  const measure = measurements.find(m => m.playerId === id) || {};

  if (!player) return <Typography>Player not found</Typography>;

  // calculate no-shoe height in feet and inches
  const noShoeInches = measure.heightNoShoes;
  const feet = Math.floor(noShoeInches / 12);
  const inches = noShoeInches % 12;

  return (
    <Paper sx={{ mt: 3, p: 3 }}>
      <Grid container spacing={2}>
        <Grid item>
          <Box
            component="img"
            src={player.photoUrl}
            alt={`${player.name} Headshot`}
            sx={{ height: 200, width: 'auto', borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs>
          <Typography variant="h4">{player.name}</Typography>
          <Typography>Team: {player.currentTeam} ({player.league})</Typography>
          <Typography sx={{ mt: 2 }}>
            Height: {feet}' {inches}" | Weight: {measure.weight} lbs
          </Typography>
        </Grid>
      </Grid>

      <StatsToggle playerId={id} />

      <Typography variant="h6" sx={{ mt: 2 }}>
        Scouting Reports
      </Typography>
      <ReportForm playerId={id} />
    </Paper>
  );
}