// ** Next Import
// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ mr: 2, display: 'flex', color: 'text.secondary' }}>
        {`© ${new Date().getFullYear()} Water Vendor`}
      </Typography>
      {hidden ? null : <Typography sx={{ color: 'text.secondary' }}>Water delivery operations and billing</Typography>}
    </Box>
  )
}

export default FooterContent
