// ** React Imports
import { Fragment, useState, SyntheticEvent, ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Input from '@mui/material/Input'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Backdrop from '@mui/material/Backdrop'
import Checkbox from '@mui/material/Checkbox'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import ListItem, { ListItemProps } from '@mui/material/ListItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'

// ** Email App Component Imports
import { setTimeout } from 'timers'
import OrderDetails from './OrderDetails'

// ** Types
import {
  OrderType,
  OrderLogType,
  OrderLabelType,
  OrderFolderType,
  OrderFoldersArrType,
  OrderFoldersObjType
} from 'src/types/app/orderTypes'
import { OptionType } from 'src/@core/components/option-menu/types'

const OrderItem = styled(ListItem)<ListItemProps>(({ theme }) => ({
  cursor: 'pointer',
  paddingTop: theme.spacing(2.25),
  paddingBottom: theme.spacing(2.25),
  justifyContent: 'space-between',
  transition: 'border 0.15s ease-in-out, transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
  '&:not(:first-child)': {
    borderTop: `1px solid ${theme.palette.divider}`
  },
  '&:hover': {
    zIndex: 2,
    boxShadow: theme.shadows[3],
    transform: 'translateY(-2px)',
    '& .mail-actions': { display: 'flex' },
    '& .mail-info-right': { display: 'none' },
    '& + .MuiListItem-root': { borderColor: 'transparent' }
  },
  [theme.breakpoints.up('xs')]: {
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5)
  },
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5)
  }
}))

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <Box sx={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
  }
}

const OrderLog = (props: OrderLogType) => {
  // ** Props
  const {
    store,
    query,
    hidden,
    lgAbove,
    dispatch,
    setQuery,
    direction,
    updateOrder,
    routeParams,
    labelColors,
    paginateOrder,
    getCurrentOrder,
    orderDetailsOpen,
    updateOrderLabel,
    handleSelectOrder,
    setOrderDetailsOpen,
    handleSelectAllOrder,
    handleLeftSidebarToggle
  } = props

  // ** State
  const [refresh, setRefresh] = useState<boolean>(false)

  // ** Vars
  const folders: OrderFoldersArrType[] = [
    {
      name: 'draft',
      icon: (
        <Box component='span' sx={{ mr: 2, display: 'flex' }}>
          <Icon icon='tabler:pencil' fontSize={20} />
        </Box>
      )
    },
    {
      name: 'spam',
      icon: (
        <Box component='span' sx={{ mr: 2, display: 'flex' }}>
          <Icon icon='tabler:alert-octagon' fontSize={20} />
        </Box>
      )
    },
    {
      name: 'trash',
      icon: (
        <Box component='span' sx={{ mr: 2, display: 'flex' }}>
          <Icon icon='tabler:trash' fontSize={20} />
        </Box>
      )
    },
    {
      name: 'inbox',
      icon: (
        <Box component='span' sx={{ mr: 2, display: 'flex' }}>
          <Icon icon='tabler:mail' fontSize={20} />
        </Box>
      )
    }
  ]

  const foldersConfig = {
    draft: {
      name: 'draft',
      icon: (
        <Box component='span' sx={{ mr: 2, display: 'flex' }}>
          <Icon icon='tabler:pencil' fontSize={20} />
        </Box>
      )
    },
    spam: {
      name: 'spam',
      icon: (
        <Box component='span' sx={{ mr: 2, display: 'flex' }}>
          <Icon icon='tabler:alert-octagon' fontSize={20} />
        </Box>
      )
    },
    trash: {
      name: 'trash',
      icon: (
        <Box component='span' sx={{ mr: 2, display: 'flex' }}>
          <Icon icon='tabler:trash' fontSize={20} />
        </Box>
      )
    },
    inbox: {
      name: 'inbox',
      icon: (
        <Box component='span' sx={{ mr: 2, display: 'flex' }}>
          <Icon icon='tabler:mail' fontSize={20} />
        </Box>
      )
    }
  }

  const foldersObj: OrderFoldersObjType = {
    inbox: [foldersConfig.spam, foldersConfig.trash],
    sent: [foldersConfig.trash],
    draft: [foldersConfig.trash],
    spam: [foldersConfig.inbox, foldersConfig.trash],
    trash: [foldersConfig.inbox, foldersConfig.spam]
  }

  const handleMoveToTrash = () => {
    dispatch(updateOrder({ orderIds: store.selectedOrders, dataToUpdate: { folder: 'trash' } }))
    dispatch(handleSelectAllOrder(false))
  }

  const handleStarOrder = (e: SyntheticEvent, id: number, value: boolean) => {
    e.stopPropagation()
    dispatch(updateOrder({ orderIds: [id], dataToUpdate: { isStarred: value } }))
  }

  const handleReadOrder = (id: number | number[], value: boolean) => {
    const arr = Array.isArray(id) ? [...id] : [id]
    dispatch(updateOrder({ orderIds: arr, dataToUpdate: { isRead: value } }))
    dispatch(handleSelectAllOrder(false))
  }

  const handleLabelUpdate = (id: number | number[], label: OrderLabelType) => {
    const arr = Array.isArray(id) ? [...id] : [id]
    dispatch(updateOrderLabel({ orderIds: arr, label }))
  }

  const handleFolderUpdate = (id: number | number[], folder: OrderFolderType) => {
    const arr = Array.isArray(id) ? [...id] : [id]
    dispatch(updateOrder({ orderIds: arr, dataToUpdate: { folder } }))
  }

  const handleRefreshOrdersClick = () => {
    setRefresh(true)
    setTimeout(() => setRefresh(false), 1000)
  }

  const handleLabelsMenu = () => {
    const array: OptionType[] = []
    Object.entries(labelColors).map(([key, value]: string[]) => {
      array.push({
        text: <Typography sx={{ textTransform: 'capitalize' }}>{key}</Typography>,
        icon: (
          <Box component='span' sx={{ mr: 2, color: `${value}.main` }}>
            <Icon icon='mdi:circle' fontSize='0.75rem' />
          </Box>
        ),
        menuItemProps: {
          onClick: () => {
            handleLabelUpdate(store.selectedOrders, key as OrderLabelType)
            dispatch(handleSelectAllOrder(false))
          }
        }
      })
    })

    return array
  }

  const handleFoldersMenu = () => {
    const array: OptionType[] = []

    if (routeParams && routeParams.folder && !routeParams.label && foldersObj[routeParams.folder]) {
      foldersObj[routeParams.folder].map((folder: OrderFoldersArrType) => {
        array.length = 0
        array.push({
          icon: folder.icon,
          text: <Typography sx={{ textTransform: 'capitalize' }}>{folder.name}</Typography>,
          menuItemProps: {
            onClick: () => {
              handleFolderUpdate(store.selectedOrders, folder.name)
              dispatch(handleSelectAllOrder(false))
            }
          }
        })
      })
    } else if (routeParams && routeParams.label) {
      folders.map((folder: OrderFoldersArrType) => {
        array.length = 0
        array.push({
          icon: folder.icon,
          text: <Typography sx={{ textTransform: 'capitalize' }}>{folder.name}</Typography>,
          menuItemProps: {
            onClick: () => {
              handleFolderUpdate(store.selectedOrders, folder.name)
              dispatch(handleSelectAllOrder(false))
            }
          }
        })
      })
    } else {
      foldersObj['inbox'].map((folder: OrderFoldersArrType) => {
        array.length = 0
        array.push({
          icon: folder.icon,
          text: <Typography sx={{ textTransform: 'capitalize' }}>{folder.name}</Typography>,
          menuItemProps: {
            onClick: () => {
              handleFolderUpdate(store.selectedOrders, folder.name)
              dispatch(handleSelectAllOrder(false))
            }
          }
        })
      })
    }

    return array
  }

  const renderOrderLabels = (arr: OrderLabelType[]) => {
    return arr.map((label: OrderLabelType, index: number) => {
      return (
        <Box key={index} component='span' sx={{ mr: 3, color: `${labelColors[label]}.main` }}>
          <Icon icon='mdi:circle' fontSize='0.625rem' />
        </Box>
      )
    })
  }

  const mailDetailsProps = {
    hidden,
    folders,
    dispatch,
    direction,
    foldersObj,
    updateOrder,
    routeParams,
    labelColors,
    paginateOrder,
    handleStarOrder,
    orderDetailsOpen,
    handleLabelUpdate,
    handleFolderUpdate,
    setOrderDetailsOpen,
    mail: store && store.currentOrder ? store.currentOrder : null
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', position: 'relative', '& .ps__rail-y': { zIndex: 5 } }}>
      <Box sx={{ height: '100%', backgroundColor: 'background.paper' }}>
        <Box sx={{ px: 5, py: 3.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {lgAbove ? null : (
              <IconButton onClick={handleLeftSidebarToggle} sx={{ mr: 1, ml: -2 }}>
                <Icon icon='tabler:menu-2' fontSize={20} />
              </IconButton>
            )}
            <Input
              value={query}
              placeholder='Search mail'
              onChange={e => setQuery(e.target.value)}
              sx={{ width: '100%', '&:before, &:after': { display: 'none' } }}
              startAdornment={
                <InputAdornment position='start' sx={{ color: 'text.disabled' }}>
                  <Icon icon='tabler:search' />
                </InputAdornment>
              }
            />
          </Box>
        </Box>
        <Divider sx={{ m: '0 !important' }} />
        <Box sx={{ py: 2, px: { xs: 2.5, sm: 5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {store && store.mails && store.selectedOrders ? (
                <Checkbox
                  onChange={e => dispatch(handleSelectAllOrder(e.target.checked))}
                  checked={(store.mails.length && store.mails.length === store.selectedOrders.length) || false}
                  indeterminate={
                    !!(
                      store.mails.length &&
                      store.selectedOrders.length &&
                      store.mails.length !== store.selectedOrders.length
                    )
                  }
                />
              ) : null}

              {store && store.selectedOrders.length && store.mails && store.mails.length ? (
                <Fragment>
                  {routeParams && routeParams.folder !== 'trash' ? (
                    <IconButton onClick={handleMoveToTrash}>
                      <Icon icon='tabler:trash' />
                    </IconButton>
                  ) : null}
                  <IconButton onClick={() => handleReadOrder(store.selectedOrders, false)}>
                    <Icon icon='tabler:mail-opened' />
                  </IconButton>
                  <OptionsMenu leftAlignMenu options={handleFoldersMenu()} icon={<Icon icon='tabler:folder' />} />
                  <OptionsMenu leftAlignMenu options={handleLabelsMenu()} icon={<Icon icon='tabler:tag' />} />
                </Fragment>
              ) : null}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size='small' onClick={handleRefreshOrdersClick}>
                <Icon icon='tabler:reload' />
              </IconButton>
              <IconButton size='small'>
                <Icon icon='tabler:dots-vertical' />
              </IconButton>
            </Box>
          </Box>
        </Box>
      {/* header start */}
        {/* <Divider sx={{ m: '0 !important' }} />
        <Box sx={{ p: 0, position: 'relative', overflowX: 'hidden', height: 'calc(100% - 7.5625rem)' }}>
          <ScrollWrapper hidden={hidden}>
            {store && store.mails && store.mails.length ? (
              <List sx={{ p: 0 }}>
                {store.mails.map((mail: OrderType) => {
                  const mailReadToggleIcon = mail.isRead ? 'tabler:mail' : 'tabler:mail-opened'

                  return (
                    <OrderItem
                      key={mail.id}
                      sx={{ backgroundColor: mail.isRead ? 'action.hover' : 'background.paper' }}
                      onClick={() => {
                        setOrderDetailsOpen(true)
                        dispatch(getCurrentOrder(mail.id))
                        dispatch(updateOrder({ orderIds: [mail.id], dataToUpdate: { isRead: true } }))
                        setTimeout(() => {
                          dispatch(handleSelectAllOrder(false))
                        }, 600)
                      }}
                    >
                      <Box sx={{ mr: 4, display: 'flex', overflow: 'hidden', alignItems: 'center' }}>
                        <Checkbox
                          onClick={e => e.stopPropagation()}
                          onChange={() => dispatch(handleSelectOrder(mail.id))}
                          checked={store.selectedOrders.includes(mail.id) || false}
                        />
                        <IconButton
                          size='small'
                          onClick={e => handleStarOrder(e, mail.id, !mail.isStarred)}
                          sx={{
                            mr: { xs: 0, sm: 3 },
                            color: mail.isStarred ? 'warning.main' : 'text.secondary',
                            '& svg': {
                              display: { xs: 'none', sm: 'block' }
                            }
                          }}
                        >
                          <Icon icon={mail.isStarred ? 'tabler:star-filled' : 'tabler:star'} />
                        </IconButton>
                        <Avatar
                          alt={mail.from.name}
                          src={mail.from.avatar}
                          sx={{ mr: 3, width: '2rem', height: '2rem' }}
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            overflow: 'hidden',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' }
                          }}
                        >
                          <Typography
                            variant='h6'
                            sx={{
                              mr: 3,
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              width: ['100%', 'auto'],
                              overflow: ['hidden', 'unset'],
                              textOverflow: ['ellipsis', 'unset']
                            }}
                          >
                            {mail.from.name}
                          </Typography>
                          <Typography noWrap sx={{ width: '100%', color: 'text.secondary' }}>
                            {mail.subject}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        className='mail-actions'
                        sx={{ display: 'none', alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        {routeParams && routeParams.folder !== 'trash' ? (
                          <Tooltip placement='top' title='Delete Order'>
                            <IconButton
                              onClick={e => {
                                e.stopPropagation()
                                dispatch(updateOrder({ orderIds: [mail.id], dataToUpdate: { folder: 'trash' } }))
                              }}
                            >
                              <Icon icon='tabler:trash' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        <Tooltip placement='top' title={mail.isRead ? 'Unread Order' : 'Read Order'}>
                          <IconButton
                            onClick={e => {
                              e.stopPropagation()
                              handleReadOrder([mail.id], !mail.isRead)
                            }}
                          >
                            <Icon icon={mailReadToggleIcon} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip placement='top' title='Move to Spam'>
                          <IconButton
                            onClick={e => {
                              e.stopPropagation()
                              handleFolderUpdate([mail.id], 'spam')
                            }}
                          >
                            <Icon icon='tabler:alert-octagon' />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box
                        className='mail-info-right'
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>{renderOrderLabels(mail.labels)}</Box>
                        <Typography
                          variant='body2'
                          sx={{ minWidth: '50px', textAlign: 'right', whiteSpace: 'nowrap', color: 'text.disabled' }}
                        >
                          {new Date(mail.time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </Typography>
                      </Box>
                    </OrderItem>
                  )
                })}
              </List>
            ) : (
              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', '& svg': { mr: 2 } }}>
                <Icon icon='tabler:alert-octagon' />
                <Typography>No Orders Found</Typography>
              </Box>
            )}
          </ScrollWrapper>
          <Backdrop
            open={refresh}
            onClick={() => setRefresh(false)}
            sx={{
              zIndex: 5,
              position: 'absolute',
              color: 'common.white',
              backgroundColor: 'action.disabledBackground'
            }}
          >
            <CircularProgress color='inherit' />
          </Backdrop>
        </Box> */}
        {/* header end */}
        <Divider sx={{ m: '0 !important' }} />
        <Box sx={{ p: 0, position: 'relative', overflowX: 'hidden', height: 'calc(100% - 7.5625rem)' }}>
          <ScrollWrapper hidden={hidden}>

        

            {store && store.mails && store.mails.length ? (


/////// internal start
              <List sx={{ p: 0 }}>


{/* my start */}
<OrderItem
                      key={0}
                      sx={{ backgroundColor: 'action.hover'}}
                      onClick={() => {
                        setOrderDetailsOpen(true)
                        dispatch(getCurrentOrder(0))
                        dispatch(updateOrder({ orderIds: [0], dataToUpdate: { isRead: true } }))
                        setTimeout(() => {
                          dispatch(handleSelectAllOrder(false))
                        }, 600)
                      }}
                    >
                      <Box
                        border={1}
                       sx={{ mr: 4, display: 'flex', overflow: 'hidden', alignItems: 'center' }}>
                        <Checkbox
                          onClick={e => e.stopPropagation()}
                          onChange={() => dispatch(handleSelectOrder(0))}
                          checked={store.selectedOrders.includes(0) || false}
                          style={{opacity: 0, pointerEvents: 'none'}}
                        />


                        <Box
                          sx={{
                            display: 'flex',
                            overflow: 'hidden',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' }
                          }}
                        >
                     Order Number
                        </Box>
                      </Box>
                      <Box
                      border={1}
                      >
                     Customer Name
                      </Box>
                      <Box
                        border={1}
                      >
                     
                     Order Date
                      </Box>

                    </OrderItem>
            
                    {/* <Divider sx={{ m: '0 !important' }} /> */}

{/* my code end */}


                {store.mails.map((mail: OrderType, index: number) => {
                  const mailReadToggleIcon = mail.isRead ? 'tabler:mail' : 'tabler:mail-opened'

                  return (
                    <OrderItem
                      key={mail.id}
                      sx={{ backgroundColor: mail.isRead ? 'action.hover' : 'background.paper' }}
                      onClick={() => {
                        setOrderDetailsOpen(true)
                        dispatch(getCurrentOrder(mail.id))
                        dispatch(updateOrder({ orderIds: [mail.id], dataToUpdate: { isRead: true } }))
                        setTimeout(() => {
                          dispatch(handleSelectAllOrder(false))
                        }, 600)
                      }}
                    >
                      <Box
                          border={1}
                      sx={{ mr: 4, display: 'flex', overflow: 'hidden', alignItems: 'center' }}>

<Box
                        border={1}
                        width={10}
                      >
                        {index + 1}.
                      </Box>

                        <Checkbox
                          onClick={e => e.stopPropagation()}
                          onChange={() => dispatch(handleSelectOrder(mail.id))}
                          checked={store.selectedOrders.includes(mail.id) || false}
                        />
                        <IconButton
                          size='small'
                          onClick={e => handleStarOrder(e, mail.id, !mail.isStarred)}
                        >
                          {/* {mail.id} */}
                        </IconButton>

                        <Box
                          sx={{
                            display: 'flex',
                            overflow: 'hidden',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' }
                          }}
                        >
                          {/* <Typography
                            variant='h6'
                            sx={{
                              mr: 3,
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              width: ['100%', 'auto'],
                              overflow: ['hidden', 'unset'],
                              textOverflow: ['ellipsis', 'unset']
                            }}
                          >
                            {mail.from.name}
                          </Typography>
                          <Typography noWrap sx={{ width: '100%', color: 'text.secondary' }}>
                            {mail.subject}
                          </Typography> */}
                        </Box>
                      </Box>
                      <Box
                        className='mail-actions'
                        sx={{ display: 'none', alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        {routeParams && routeParams.folder !== 'trash' ? (
                          <Tooltip placement='top' title='Delete Order'>
                            <IconButton
                              onClick={e => {
                                e.stopPropagation()
                                dispatch(updateOrder({ orderIds: [mail.id], dataToUpdate: { folder: 'trash' } }))
                              }}
                            >
                              <Icon icon='tabler:trash' />
                            </IconButton>
                          </Tooltip>
                        ) : null}

                        <Tooltip placement='top' title={mail.isRead ? 'Unread Order' : 'Read Order'}>
                          <IconButton
                            onClick={e => {
                              e.stopPropagation()
                              handleReadOrder([mail.id], !mail.isRead)
                            }}
                          >
                            <Icon icon={mailReadToggleIcon} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip placement='top' title='Move to Spam'>
                          <IconButton
                            onClick={e => {
                              e.stopPropagation()
                              handleFolderUpdate([mail.id], 'spam')
                            }}
                          >
                            <Icon icon='tabler:alert-octagon' />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box
                        className='mail-info-right'
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>{renderOrderLabels(mail.labels)}</Box>
                        <Typography
                          variant='body2'
                          sx={{ minWidth: '50px', textAlign: 'right', whiteSpace: 'nowrap', color: 'text.disabled' }}
                        >
                          {new Date(mail.time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </Typography>
                      </Box>
                    </OrderItem>
                  )
                })}



              </List>

////  internal end

            ) : (
              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', '& svg': { mr: 2 } }}>
                <Icon icon='tabler:alert-octagon' />
                <Typography>No Orders Found</Typography>
              </Box>
            )}
          </ScrollWrapper>
          <Backdrop
            open={refresh}
            onClick={() => setRefresh(false)}
            sx={{
              zIndex: 5,
              position: 'absolute',
              color: 'common.white',
              backgroundColor: 'action.disabledBackground'
            }}
          >
            <CircularProgress color='inherit' />
          </Backdrop>
        </Box>
      </Box>

      {/* @ts-ignore */}
      <OrderDetails {...mailDetailsProps} />
    </Box>
  )
}

export default OrderLog
