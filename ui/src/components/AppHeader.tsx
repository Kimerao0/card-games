import { type FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectCurrentUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { Row } from '@/components/layout';

export const AppHeader: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const handleUserIconClick = (): void => {
    if (isAuthenticated) {
      dispatch(logout());
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <AppBar position="absolute" style={{ backgroundColor: '#333' }}>
      <Toolbar style={{ minHeight: '34px' }}>
        <Row style={{ maxWidth: '1920px', margin: '0 auto', width: '100%', alignItems: 'center' }}>
          <Link to="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
            Card Games
          </Link>
          <Typography variant="body2" style={{ marginRight: 8 }}>
            {isAuthenticated ? currentUser?.name : 'Guest'}
          </Typography>
          <Tooltip title={isAuthenticated ? 'Esci' : 'Accedi'}>
            <IconButton color="inherit" onClick={handleUserIconClick}>
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Row>
      </Toolbar>
    </AppBar>
  );
};
