// ** React Imports
import { useState, MouseEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Avatar from '@mui/material/Avatar'
import MenuItem from '@mui/material/MenuItem'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Hook Import
import { useAuth } from 'src/hooks/useAuth'

interface Props {
  settings: Settings
  navHover?: boolean
}

// The signed-in user, pinned to the foot of the sidebar. It used to sit alone in
// a top bar that took a whole row above every page (client request, 26 Nov 2026).
const SidebarUserMenu = ({ settings, navHover }: Props) => {
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  if (!user) return null

  const displayName = user.fullName?.trim() || user.email || 'Water Vendor User'
  const showText = !(settings.navCollapsed && !navHover)

  const close = () => setAnchorEl(null)

  return (
    <Box sx={{ mt: 'auto', px: 2.5, py: 2.5, borderTop: theme => `1px solid ${theme.palette.divider}` }}>
      <ButtonBase
        aria-label='Account menu'
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
        sx={{
          width: '100%',
          px: 1.5,
          py: 1.5,
          gap: 2.5,
          display: 'flex',
          textAlign: 'left',
          borderRadius: 1,
          justifyContent: 'flex-start',
          '&:hover': { backgroundColor: 'action.hover' }
        }}
      >
        <Avatar alt={displayName} sx={{ width: 34, height: 34, fontSize: '0.95rem', bgcolor: 'primary.main' }}>
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        {showText ? (
          <>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }}>
                {displayName}
              </Typography>
              {user.email && user.email !== displayName ? (
                <Typography noWrap variant='body2' sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  {user.email}
                </Typography>
              ) : null}
            </Box>
            <Icon icon='tabler:selector' fontSize='1.1rem' />
          </>
        ) : null}
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ '& .MuiMenu-paper': { minWidth: 220, mt: -1 } }}
      >
        <MenuItem
          onClick={() => {
            close()
            logout()
          }}
          sx={{ gap: 2.5 }}
        >
          <Icon icon='tabler:logout' fontSize='1.25rem' />
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default SidebarUserMenu
