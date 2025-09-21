import React from 'react';
import { List, ListItem, ListItemText, IconButton, ListItemAvatar, Avatar, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

function DocumentList({ documents = [], onDelete }) {
  if (documents.length === 0) {
    return <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Nessun documento caricato.</Typography>;
  }

  return (
    <List>
      {documents.map((doc) => (
        <ListItem
          key={doc.id}
          secondaryAction={
            <>
              <IconButton edge="end" href={doc.url} target="_blank" rel="noopener noreferrer" title="Scarica">
                <DownloadIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => onDelete(doc.id, doc.filePath)} sx={{ ml: 1 }} title="Elimina">
                <DeleteIcon color="error" />
              </IconButton>
            </>
          }
        >
          <ListItemAvatar>
            <Avatar><InsertDriveFileIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={doc.name} 
            secondary={`Caricato il: ${new Date(doc.createdAt.toDate()).toLocaleDateString('it-IT')}`} 
          />
        </ListItem>
      ))}
    </List>
  );
}

export default DocumentList;