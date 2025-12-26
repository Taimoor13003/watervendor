// ** MUI Import
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Link from 'next/link'

// ** Demo Component Imports
import AnalyticsProject from 'src/views/dashboards/analytics/AnalyticsProject'
import AnalyticsOrderVisits from 'src/views/dashboards/analytics/AnalyticsOrderVisits'
import AnalyticsTotalEarning from 'src/views/dashboards/analytics/AnalyticsTotalEarning'
import AnalyticsSourceVisits from 'src/views/dashboards/analytics/AnalyticsSourceVisits'
import AnalyticsEarningReports from 'src/views/dashboards/analytics/AnalyticsEarningReports'
import AnalyticsSupportTracker from 'src/views/dashboards/analytics/AnalyticsSupportTracker'
import AnalyticsSalesByCountries from 'src/views/dashboards/analytics/AnalyticsSalesByCountries'
import AnalyticsMonthlyCampaignState from 'src/views/dashboards/analytics/AnalyticsMonthlyCampaignState'
import AnalyticsWebsiteAnalyticsSlider from 'src/views/dashboards/analytics/AnalyticsWebsiteAnalyticsSlider'

// ** Custom Component Import
import KeenSliderWrapper from 'src/@core/styles/libs/keen-slider'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import CardStatsWithAreaChart from 'src/@core/components/card-statistics/card-stats-with-area-chart'

const AnalyticsDashboard = () => {
  const quickLinks = [
    { label: 'Customers', href: '/app/customers' },
    { label: 'Create Order', href: '/app/orders/create' },
    { label: 'Invoices', href: '/app/customerinvoice' }
  ]

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        background: theme =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #e3f2fd 0%, #f9fbff 50%, #ffffff 100%)'
            : 'linear-gradient(135deg, #0d1b2a 0%, #112240 45%, #0b1320 100%)',
        py: { xs: 8, md: 10 }
      }}
    >
      <Container maxWidth='md'>
        <Stack spacing={3} textAlign='center' alignItems='center'>
          <Chip
            label='Welcome to your ops hub'
            color='primary'
            variant='outlined'
            sx={{ fontWeight: 600, letterSpacing: 0.4 }}
          />
          <Typography variant='h3' fontWeight={800} lineHeight={1.2}>
            Keep your deliveries flowing and customers happy.
          </Typography>
          <Typography variant='body1' color='text.secondary' maxWidth={560}>
            Jump into customers, create new orders, or review invoices. This space is your quick start—no charts, just the actions you need first.
          </Typography>
          <Stack direction='row' spacing={2} flexWrap='wrap' justifyContent='center'>
            {quickLinks.map(link => (
              <Button
                key={link.href}
                variant='contained'
                component={Link}
                href={link.href}
                sx={{ minWidth: 150 }}
              >
                {link.label}
              </Button>
            ))}
            <Button
              variant='outlined'
              component={Link}
              href='/app/orders'
              sx={{ minWidth: 150 }}
            >
              View Orders
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default AnalyticsDashboard
