import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import Ingresos from '@/components/Ingresos'
import Gastos from '@/components/Gastos'
import Resumen from '@/components/Resumen'
import Inversiones from '@/components/Inversiones'
import Ahorro from '@/components/Ahorro'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'

interface TabPanelProps {
  children: React.ReactNode
  value: number
  index: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null
  return <Box sx={{ pt: 2 }}>{children}</Box>
}

export default function Finanzas() {
  const [mainTab, setMainTab] = useState(0)
  const [subTab, setSubTab] = useState(0)

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountBalanceIcon fontSize="small" />
              </Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Finanzas
              </Typography>
            </Box>

            <Tabs
              value={mainTab}
              onChange={(_, v) => { setMainTab(v); setSubTab(0) }}
            >
              <Tab label="Presupuesto" />
              <Tab label="Ahorro" />
              <Tab label="Inversión en negocios" />
            </Tabs>

            <TabPanel value={mainTab} index={0}>
              <Tabs
                value={subTab}
                onChange={(_, v) => setSubTab(v)}
                sx={{ mb: 1 }}
              >
                <Tab label="Resumen" />
                <Tab label="Ingresos" />
                <Tab label="Gastos" />
              </Tabs>

              <TabPanel value={subTab} index={0}>
                <Resumen />
              </TabPanel>

              <TabPanel value={subTab} index={1}>
                <Ingresos />
              </TabPanel>

              <TabPanel value={subTab} index={2}>
                <Gastos />
              </TabPanel>
            </TabPanel>

            <TabPanel value={mainTab} index={1}>
              <Ahorro />
            </TabPanel>

            <TabPanel value={mainTab} index={2}>
              <Inversiones />
            </TabPanel>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
