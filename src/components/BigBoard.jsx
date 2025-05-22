import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import playersData from '../data/players.json';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Typography
} from '@mui/material';

// Comparator helper
function getComparator(order, orderBy) {
  return (a, b) => {
    let valA, valB;
    if (orderBy === 'overall') {
      valA = a.overall;
      valB = b.overall;
    } else if (orderBy === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else {
      valA = a.rank[orderBy] ?? Infinity;
      valB = b.rank[orderBy] ?? Infinity;
    }
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    // tie-breaker on overall
    return a.overall - b.overall;
  };
}

export default function BigBoard() {
  const { bio, scoutRankings } = playersData;

  // build initial rows with overall rank
  const initialRows = useMemo(() => {
    const merged = scoutRankings.map(rank => {
      const player = bio.find(p => p.playerId === rank.playerId);
      const scores = Object.values(rank).filter(v => v !== rank.playerId && v != null);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return { ...player, rank, avg };
    }).sort((a, b) => a.avg - b.avg);
    return merged.map((row, index) => ({ ...row, overall: index + 1 }));
  }, [bio, scoutRankings]);

  const [orderBy, setOrderBy] = useState('overall');
  const [order, setOrder] = useState('asc');

  const handleSort = (field) => {
    if (orderBy === field) {
      setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(field);
      setOrder('asc');
    }
  };

  const rows = useMemo(() => {
    return [...initialRows].sort(getComparator(order, orderBy));
  }, [initialRows, order, orderBy]);

  // scout columns
  const scoutCols = Object.keys(scoutRankings[0]).filter(k => k !== 'playerId');

  return (
    <Paper sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ p: 2 }}>Big Board</Typography>
      <TableContainer sx={{ maxHeight: '70vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'overall' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'overall'}
                  direction={orderBy === 'overall' ? order : 'asc'}
                  onClick={() => handleSort('overall')}
                >
                  Overall
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Player
                </TableSortLabel>
              </TableCell>
              {scoutCols.map(scout => (
                <TableCell key={scout} sortDirection={orderBy === scout ? order : false}>
                  <TableSortLabel
                    active={orderBy === scout}
                    direction={orderBy === scout ? order : 'asc'}
                    onClick={() => handleSort(scout)}
                  >
                    {scout}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.playerId}
                hover
                component={Link}
                to={`/player/${row.playerId}`}
                sx={{ textDecoration: 'none' }}
              >
                <TableCell>{row.overall}</TableCell>
                <TableCell>{row.name}</TableCell>
                {scoutCols.map(scout => {
                  const deviation = row.rank[scout] != null ? row.rank[scout] - row.avg : 0;
                  const color = deviation <= -2 ? 'green' : deviation >= 2 ? 'red' : 'inherit';
                  return (
                    <TableCell key={scout} sx={{ color }}>
                      {row.rank[scout] ?? '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}