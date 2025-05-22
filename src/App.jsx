import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import BigBoard from './components/BigBoard';
import PlayerProfile from './components/PlayerProfile';
import mavsLogo from './assets/mavs_logo.png';

export default function App() {
  return (
    <Container maxWidth="lg">
      <AppBar position="static" color="primary">
        <Toolbar>
          {/* Mavericks Logo */}
          <Box
            component="img"
            src={mavsLogo}
            alt="Mavericks Logo"
            sx={{ height: 40, mr: 2 }}
          />

          {/* App Title */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            NBA Draft Hub
          </Typography>

          {/* Nav Button */}
          <Button component={Link} to="/" color="inherit">
            Big Board
          </Button>
        </Toolbar>
      </AppBar>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<BigBoard />} />
        <Route path="/player/:playerId" element={<PlayerProfile />} />
      </Routes>
    </Container>
  );
}