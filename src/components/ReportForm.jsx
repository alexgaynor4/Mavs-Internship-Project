import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

// simple form to add a new scouting report
export default function ReportForm({ onAdd }) {
  const [reportText, setReportText] = useState('');

  // handle form submission
  const handleSubmit = e => {
    e.preventDefault();
    const text = reportText.trim();
    if (!text) return;
    onAdd(text);
    setReportText('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="New Scouting Report"
        multiline
        rows={3}
        fullWidth
        value={reportText}
        onChange={e => setReportText(e.target.value)}
      />
      <Button type="submit" variant="contained" sx={{ mt: 1 }}>
        Add Report
      </Button>
    </Box>
  );
}