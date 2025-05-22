import React, { useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';

export default function ReportForm({ playerId }) {
  const [reports, setReports] = useState([]);
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      setReports(prev => [...prev, { id: Date.now(), text }]);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <TextField
        label="New Scouting Report"
        fullWidth
        multiline
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <Button type="submit" variant="contained" sx={{ mt: 1 }}>Add Report</Button>
      <List>
        {reports.map(r => (
          <ListItem key={r.id}><ListItemText primary={r.text} /></ListItem>
        ))}
      </List>
    </form>
  );
}