import React, { useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

function FileUpload({ onUpload, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <Box sx={{ p: 2, border: '2px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
      <Typography gutterBottom>Carica un nuovo documento (PDF, JPG, PNG)</Typography>
      <Button variant="outlined" component="label">
        Seleziona File
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
      {selectedFile && <Typography sx={{ mt: 1 }}>File selezionato: {selectedFile.name}</Typography>}
      {isLoading ? (
        <LinearProgress sx={{ mt: 2 }} />
      ) : (
        <Button 
          variant="contained" 
          startIcon={<UploadFileIcon />} 
          onClick={handleUploadClick} 
          disabled={!selectedFile}
          sx={{ display: 'block', mx: 'auto', mt: 2 }}
        >
          Carica
        </Button>
      )}
    </Box>
  );
}

export default FileUpload;