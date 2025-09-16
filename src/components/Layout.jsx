import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, Typography, Button, Divider, IconButton, Badge, Menu, MenuItem } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext.jsx';

const drawerWidth = 240;

function Layout({ children, notifications = [] }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();
  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleNotificationsClick = (event) => { setAnchorEl(event.currentTarget); };
  const handleNotificationsClose = () => { setAnchorEl(null); };
  
  const totalNotifications = notifications.reduce((sum, notif) => sum + notif.count, 0);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">ASD GYM POINT</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>{currentUser?.email}</Typography>
            <IconButton color="inherit" onClick={handleNotificationsClick}>
              <Badge badgeContent={totalNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
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
            <Divider sx={{ my: 1 }} />
            <ListItemButton component={RouterLink} to="/report"><ListItemIcon><AssessmentIcon /></ListItemIcon><ListItemText primary="Report Finanziario" /></ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleNotificationsClose}
      >
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <MenuItem 
              key={notif.type} 
              component={RouterLink}
              to={`/iscritti?filtro=${notif.type}`}
              onClick={handleNotificationsClose}
            >
              {notif.message}
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleNotificationsClose}>Nessuna notifica</MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export default Layout;