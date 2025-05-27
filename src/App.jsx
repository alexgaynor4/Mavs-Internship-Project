import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import BigBoard from './components/BigBoard';
import PlayerProfile from './components/PlayerProfile';
import mavsLogo from './assets/mavs_logo.png';

// main app component
function App() {
  return (
    <Container maxWidth="lg">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Box
            component="img"
            src={mavsLogo}
            alt="Mavs Logo"
            style={{ height: 40, marginRight: 16 }}
          />
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            NBA Draft Hub
          </Typography>
          <Button component={Link} to="/" color="inherit">
            Big Board
          </Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<BigBoard />} />
        <Route path="/player/:playerId" element={<PlayerProfile />} />
      </Routes>
    </Container>
  );
}

export default App;
