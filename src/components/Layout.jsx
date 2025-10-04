// File: src/components/Layout.jsx

import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Badge,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import AssessmentIcon from "@mui/icons-material/Assessment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupsIcon from "@mui/icons-material/Groups";
import BadgeIcon from "@mui/icons-material/Badge";
import OrarioIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import ArchivioIcon from "@mui/icons-material/Archive";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import packageJson from "../../package.json";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const drawerWidth = 280;

// --- INIZIO CORREZIONE ---
// Aggiunta la riga mancante per il Registro Tecnici
const navSections = [
  {
    title: "Gestione Generale",
    links: [
      { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
      { text: "Orario", path: "/orario", icon: <OrarioIcon /> },
      { text: "Agenda", path: "/agenda", icon: <EventIcon /> },
    ],
  },
  {
    title: "Anagrafica & Dati",
    links: [
      { text: "Iscritti", path: "/iscritti", icon: <PeopleIcon /> },
      { text: "Gruppi", path: "/gruppi", icon: <GroupsIcon /> },
      { text: "Tecnici", path: "/tecnici", icon: <BadgeIcon /> },
      { text: "Registro Tecnici", path: "/registro-tecnici", icon: <PeopleAltIcon /> },
      { text: "Archivio", path: "/archivio", icon: <ArchivioIcon /> },
    ],
  },
  {
    title: "Contabilità & Report",
    links: [
      { text: "Report Finanziario", path: "/report", icon: <AssessmentIcon /> },
    ],
  },
];
// --- FINE CORREZIONE ---

function Layout({ children, notifications = [] }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
  const handleNotificationsClick = (event) => setAnchorEl(event.currentTarget);
  const handleNotificationsClose = () => setAnchorEl(null);

  const totalNotifications = notifications.reduce(
    (sum, notif) => sum + notif.count,
    0
  );
  const open = Boolean(anchorEl);
  const sidebarTextColor = theme.palette.text.primary;
  const sidebarIconColor = theme.palette.text.secondary;
  const selectedColor = theme.palette.primary.main;
  const selectedBackgroundColor = theme.palette.primary.main + "20";
  const isOrarioPage =
    location.pathname === "/orario" || location.pathname === "/agenda";

  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ overflow: "auto", p: 1 }}>
        {navSections.map((section, index) => (
          <Box key={section.title} sx={{ mb: 2, pt: index === 0 ? 0 : 1 }}>
            <Typography
              variant="caption"
              sx={{
                ml: 1,
                mb: 0.5,
                fontWeight: "bold",
                color: "text.secondary",
                textTransform: "uppercase",
                display: "block",
              }}
            >
              {section.title}
            </Typography>
            <List component="nav" disablePadding>
              {section.links.map((link) => (
                <ListItemButton
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  selected={location.pathname === link.path}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    color: sidebarTextColor,
                    px: 1,
                    py: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    "&:hover": {
                      backgroundColor: selectedBackgroundColor,
                      color: selectedColor,
                    },
                    "&.Mui-selected": {
                      backgroundColor: selectedBackgroundColor,
                      color: selectedColor,
                      borderLeft: `4px solid ${selectedColor}`,
                      paddingLeft: "12px",
                      "&:hover": {
                        backgroundColor: selectedBackgroundColor,
                        opacity: 0.9,
                      },
                    },
                    "& .MuiListItemIcon": {
                      minWidth: 30,
                      color:
                        link.path === location.pathname
                          ? selectedColor
                          : sidebarIconColor,
                    },
                    "& .MuiListItemText-primary": { fontWeight: "bold" },
                  }}
                >
                  <ListItemIcon>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.text} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          p: 2,
          mt: "auto",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          asdgympointOS 🌩️
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          Versione {packageJson.version}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          Sviluppato da Daniele Arcangeli
        </Typography>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "background.paper",
          color: "text.primary",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            ASD GYM POINT
          </Typography>

          {/* Box invisibile per spingere tutto a destra */}
          <Box sx={{ flexGrow: 1 }} />

          {/* --- BLOCCO DI PULSANTI ALLINEATO A DESTRA --- */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              component={RouterLink}
              to="/documentazione"
              color="inherit"
              startIcon={<DescriptionIcon />}
            >
              Documentazione
            </Button>
            <Button
              component={RouterLink}
              to="/credits"
              color="inherit"
              startIcon={<InfoIcon />}
            >
              Crediti e Log
            </Button>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Typography variant="body2">{currentUser?.email}</Typography>
            <IconButton color="inherit" onClick={handleNotificationsClick}>
              <Badge badgeContent={totalNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>

          {/* Gestione per mobile (solo icone) */}
          <Box
            sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}
          >
            <IconButton color="inherit" onClick={handleNotificationsClick}>
              <Badge badgeContent={totalNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          maxWidth: isOrarioPage ? "none" : "1400px",
          margin: isOrarioPage ? "0" : "0 auto",
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <Menu anchorEl={anchorEl} open={open} onClose={handleNotificationsClose}>
        {notifications.length > 0 ? (
          notifications.map((notif) => (
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
          <MenuItem onClick={handleNotificationsClose}>
            Nessuna notifica
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
export default Layout;