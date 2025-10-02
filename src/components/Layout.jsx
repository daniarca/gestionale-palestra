// File: src/components/Layout.jsx

import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import AssessmentIcon from "@mui/icons-material/Assessment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupsIcon from "@mui/icons-material/Groups";
import BadgeIcon from "@mui/icons-material/Badge";
import OrarioIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event"; // Icona per l'agenda
import ArchivioIcon from "@mui/icons-material/Archive";
import DescriptionIcon from "@mui/icons-material/Description";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext.jsx";
import packageJson from "../../package.json";

const drawerWidth = 280;

const navSections = [
  {
    title: "Gestione Generale",
    links: [
      { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
      { text: "Orario", path: "/orario", icon: <OrarioIcon /> },
      { text: "Agenda", path: "/agenda", icon: <EventIcon /> }, // Aggiungi il link all'agenda
    ],
  },
  {
    title: "Anagrafica & Dati",
    links: [
      { text: "Iscritti", path: "/iscritti", icon: <PeopleIcon /> },
      { text: "Gruppi", path: "/gruppi", icon: <GroupsIcon /> },
      { text: "Staff", path: "/staff", icon: <BadgeIcon /> },
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

function Layout({ children, notifications = [] }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const theme = useTheme();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };
  const totalNotifications = notifications.reduce(
    (sum, notif) => sum + notif.count,
    0
  );

  const sidebarTextColor = theme.palette.text.primary;
  const sidebarIconColor = theme.palette.text.secondary;

  const selectedColor = theme.palette.primary.main;
  const selectedBackgroundColor = theme.palette.primary.main + "20";

  const isDocSelected = location.pathname === "/documentazione";

  const isOrarioPage =
    location.pathname === "/orario" || location.pathname === "/agenda";

  return (
    <Box sx={{ display: "flex" }}>
      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: sidebarTextColor,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
          >
            ASD GYM POINT
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              component={RouterLink}
              to="/documentazione"
              color="inherit"
              startIcon={<DescriptionIcon />}
              sx={{
                color: isDocSelected ? selectedColor : sidebarTextColor,
                backgroundColor: isDocSelected
                  ? selectedBackgroundColor
                  : "transparent",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: isDocSelected
                    ? selectedBackgroundColor
                    : theme.palette.divider,
                },
              }}
            >
              Documentazione
            </Button>

            <Typography
              variant="body2"
              sx={{
                display: { xs: "none", sm: "block" },
                color: sidebarTextColor,
              }}
            >
              {currentUser?.email}
            </Typography>
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
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.paper,
            display: "flex",
            flexDirection: "column",
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
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
                  color: theme.palette.text.secondary,
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
                      "& .MuiListItemText-primary": {
                        fontWeight: "bold",
                      },
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
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
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
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
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
