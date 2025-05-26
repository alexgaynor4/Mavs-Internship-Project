// src/components/ReportForm.jsx
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

export default function ReportForm({ onAdd }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="New Scouting Report"
        multiline
        rows={3}
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button type="submit" variant="contained" sx={{ mt: 1 }}>
        Add Report
      </Button>
    </Box>
  );
}
