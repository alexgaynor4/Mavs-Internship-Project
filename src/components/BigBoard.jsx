import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel
} from '@mui/material';
import playersData from '../data/players.json';

export default function BigBoard() {
  const { bio, scoutRankings } = playersData;

  // build rows with overall rank
  const rowsInit = useMemo(() => {
    const list = scoutRankings.map(rank => {
      const player = bio.find(p => p.playerId === rank.playerId);
      const scores = Object.entries(rank)
        .filter(([k,v]) => k !== 'playerId' && v != null)
        .map(([_,v]) => v);
      const avg = scores.reduce((a,b) => a + b, 0) / scores.length;
      return { ...player, rank, avg };
    });
    list.sort((a,b) => a.avg - b.avg);
    return list.map((item,i) => ({ ...item, overall: i + 1 }));
  }, [bio, scoutRankings]);

  // sorter
  function getSort(order, key) {
    return (a, b) => {
      let va = key === 'name' ? a.name.toLowerCase() : a[key] ?? a.avg;
      let vb = key === 'name' ? b.name.toLowerCase() : b[key] ?? b.avg;
      if (va < vb) return order === 'asc' ? -1 : 1;
      if (va > vb) return order === 'asc' ? 1 : -1;
      return a.avg - b.avg;
    };
  }

  const [sortKey, setSortKey] = useState('overall');
  const [sortOrder, setSortOrder] = useState('asc');
  const sortedRows = useMemo(
    () => [...rowsInit].sort(getSort(sortOrder, sortKey)),
    [rowsInit, sortKey, sortOrder]
  );

  // columns to show from scoutRankings
  const scouts = Object.keys(scoutRankings[0]).filter(k => k !== 'playerId');

  const handleSort = field => {
    if (sortKey === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(field);
      setSortOrder('asc');
    }
  };

  return (
    <Paper style={{ margin: 16 }}>
      <Typography variant="h5" style={{ padding: 16 }}>
        Big Board
      </Typography>
      <TableContainer style={{ maxHeight: '70vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortKey === 'overall'}
                  direction={sortOrder}
                  onClick={() => handleSort('overall')}
                >
                  Overall
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortKey === 'name'}
                  direction={sortOrder}
                  onClick={() => handleSort('name')}
                >
                  Player
                </TableSortLabel>
              </TableCell>
              {scouts.map(s => (
                <TableCell key={s}>
                  <TableSortLabel
                    active={sortKey === s}
                    direction={sortOrder}
                    onClick={() => handleSort(s)}
                  >
                    {s}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.map(row => (
              <TableRow
                key={row.playerId}
                hover
                component={Link}
                to={`/player/${row.playerId}`}
                style={{ textDecoration: 'none' }}
              >
                <TableCell>{row.overall}</TableCell>
                <TableCell>{row.name}</TableCell>
                {scouts.map(s => {
                  const val = row.rank[s] != null ? row.rank[s] : '-';
                  const diff = row.rank[s] != null ? row.rank[s] - row.avg : 0;
                  const color = diff <= -2 ? 'green' : diff >= 2 ? 'red' : 'inherit';
                  return (
                    <TableCell key={s} style={{ color }}>
                      {val}
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