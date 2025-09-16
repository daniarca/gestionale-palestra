import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, Typography, Button, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment'; // <-- NUOVA ICONA
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext.jsx';

const drawerWidth = 240;

function Layout({ children }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();
  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">ASD GYM POINT</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">{currentUser?.email}</Typography>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton component={RouterLink} to="/"><ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText primary="Dashboard" /></ListItemButton>
            <ListItemButton component={RouterLink} to="/iscritti"><ListItemIcon><PeopleIcon /></ListItemIcon><ListItemText primary="Iscritti" /></ListItemButton>
            {/* --- INIZIA MODIFICA --- */}
            <Divider sx={{ my: 1 }} />
            <ListItemButton component={RouterLink} to="/report">
              <ListItemIcon><AssessmentIcon /></ListItemIcon>
              <ListItemText primary="Report Finanziario" />
            </ListItemButton>
            {/* --- FINISCI MODIFICA --- */}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;