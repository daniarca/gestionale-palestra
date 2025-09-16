import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

function StatCard({ title, value, icon, color = 'primary.main' }) {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        borderRadius: 4,
        backgroundColor: 'background.paper',
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1.5 }}>
        {/* Clona l'icona passata come prop per applicare uno stile */}
        {React.cloneElement(icon, { sx: { fontSize: '1.1rem' } })}
        <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="p" sx={{ fontWeight: 'bold', color }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default StatCard;