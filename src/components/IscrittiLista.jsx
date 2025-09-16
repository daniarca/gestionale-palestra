import React from 'react';
import { Card, CardActionArea, Typography, Grid, Box, Checkbox, Chip, Stack } from '@mui/material';

function IscrittiLista({ iscritti = [], onSelect, selection = [], onViewDetails }) {
  
  const handleCardClick = (iscritto) => {
    onViewDetails(iscritto);
  };
  
  const handleCheckboxClick = (e, id) => {
    e.stopPropagation();
    onSelect(id);
  };

  const getCertificatoStatus = (certificato) => {
    if (!certificato?.presente) {
      return { label: 'Certificato Mancante', color: 'error' };
    }
    if (!certificato.scadenza) {
      return { label: 'Scadenza Non Imp.', color: 'error' };
    }
    const oggi = new Date();
    const scadenza = new Date(certificato.scadenza);
    oggi.setHours(0, 0, 0, 0);
    if (scadenza < oggi) {
      return { label: 'Certificato Scaduto', color: 'warning' };
    }
    return { label: 'Certificato OK', color: 'success' };
  };

  const getAbbonamentoStatus = (abbonamento) => {
    if (!abbonamento?.scadenza) {
      return { label: 'Non Attivo', color: 'default' };
    }
    const oggi = new Date();
    const scadenza = new Date(abbonamento.scadenza);
    oggi.setHours(0, 0, 0, 0);
    if (scadenza < oggi) {
      return { label: 'Scaduto', color: 'error' };
    }
    return { label: 'Attivo', color: 'success' };
  };

  return (
    <Grid container spacing={3}>
      {iscritti.map(iscritto => {
        const isSelected = selection.includes(iscritto.id);
        const certificatoStatus = getCertificatoStatus(iscritto.certificatoMedico);
        const abbonamentoStatus = getAbbonamentoStatus(iscritto.abbonamento);
        
        return (
          <Grid item xs={12} sm={6} md={4} key={iscritto.id}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                borderRadius: 2,
                backgroundColor: isSelected ? 'primary.dark' : 'background.paper',
                transition: 'background-color 0.2s',
                border: '1px solid',
                borderColor: isSelected ? 'primary.main' : 'transparent'
              }}
            >
              <CardActionArea onClick={() => handleCardClick(iscritto)} sx={{ flexGrow: 1, p: 2 }}>
                <Checkbox
                  checked={isSelected}
                  onClick={(e) => handleCheckboxClick(e, iscritto.id)}
                  sx={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }}
                />
                <Box>
                  <Typography variant="h6" component="p" sx={{ fontWeight: 'bold', mb: 1, pr: '30px' }}>
                    {iscritto.nome} {iscritto.cognome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sede: {iscritto.sede || 'N/D'}
                  </Typography>
                </Box>
              </CardActionArea>
              <Stack direction="row" spacing={1} sx={{ p: 2, pt: 0, mt: 'auto' }}>
                <Chip 
                  label={abbonamentoStatus.label} 
                  color={abbonamentoStatus.color} 
                  size="small" 
                  sx={{ flex: 1, fontWeight: 'bold' }}
                />
                <Chip 
                  label={certificatoStatus.label} 
                  color={certificatoStatus.color} 
                  size="small" 
                  sx={{ flex: 1, fontWeight: 'bold' }}
                />
              </Stack>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  );
}

export default IscrittiLista;