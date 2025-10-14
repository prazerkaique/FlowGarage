import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Avatar, 
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  SmartToy as SmartToyIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
    handleClose();
  };

  const handleProfileClick = () => {
    navigate('/settings?tab=pessoal');
    handleClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleClose();
  };

  const handleAgentsClick = () => {
    navigate('/agents');
    handleClose();
  };

  const handleWhatsAppClick = () => {
    navigate('/whatsapp');
    handleClose();
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{
        backgroundColor: '#101012',
        boxShadow: 'none',
        borderRadius: 0,
        mb: 3
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 1, sm: 2 } }}>
        {/* Logo responsivo */}
        <Box 
          sx={{ 
            position: { xs: 'static', sm: 'absolute' },
            left: { sm: '50%' },
            transform: { sm: 'translateX(-50%)' },
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            cursor: 'pointer',
            flex: { xs: 1, sm: 'none' },
            justifyContent: { xs: 'flex-start', sm: 'center' },
            '&:hover': {
              opacity: 0.8,
              transition: 'opacity 0.2s ease'
            }
          }}
          onClick={() => navigate('/vehicles')}
        >
          {/* Logo da empresa */}
        <img 
          src="/Flo Garage.png" 
          alt="Flo Garage" 
          style={{
            height: window.innerWidth < 600 ? '45px' : '60px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)' // Torna o logo branco
          }}
        />
        </Box>
        
        {/* Espaço vazio para manter o layout em desktop */}
        <Box sx={{ flex: { xs: 0, sm: 1 }, display: { xs: 'none', sm: 'block' } }} />

        {/* Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontFamily: '"Space Grotesk", sans-serif',
              display: { xs: 'none', md: 'block' },
              fontSize: { sm: '0.875rem', md: '1rem' }
            }}
          >
            Olá, {user?.name || 'Usuário'}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{ 
              p: 0,
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s ease'
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: { xs: 35, sm: 40 }, 
                height: { xs: 35, sm: 40 },
                background: user?.profileImage ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
              src={user?.profileImage || undefined}
            >
              {!user?.profileImage && <AccountCircleIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: '#101012',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                mt: 1,
                minWidth: 220
              }
            }}
          >
            {/* Perfil */}
            <MenuItem 
              onClick={handleProfileClick}
              sx={{ 
                color: 'white',
                fontFamily: '"Space Grotesk", sans-serif',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <PersonIcon sx={{ mr: 2 }} />
              Meu Perfil
            </MenuItem>
            
            {/* Configurações */}
            <MenuItem 
              onClick={handleSettingsClick}
              sx={{ 
                color: 'white',
                fontFamily: '"Space Grotesk", sans-serif',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <SettingsIcon sx={{ mr: 2 }} />
              Configurações
            </MenuItem>
            
            {/* Agentes */}
            <MenuItem 
              onClick={handleAgentsClick}
              sx={{ 
                color: 'white',
                fontFamily: '"Space Grotesk", sans-serif',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <SmartToyIcon sx={{ mr: 2 }} />
              Agentes
            </MenuItem>
            
            {/* API WhatsApp */}
            <MenuItem 
              onClick={handleWhatsAppClick}
              sx={{ 
                color: 'white',
                fontFamily: '"Space Grotesk", sans-serif',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <WhatsAppIcon sx={{ mr: 2 }} />
              API WhatsApp
            </MenuItem>
            
            {/* Sair */}
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                color: 'white',
                fontFamily: '"Space Grotesk", sans-serif',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                borderTop: '1px solid rgba(255,255,255,0.1)',
                mt: 1
              }}
            >
              <LogoutIcon sx={{ mr: 2 }} />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;