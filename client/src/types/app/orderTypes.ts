// ** Types
import { Dispatch } from 'redux'
import { ReactElement, SyntheticEvent } from 'react'

export type OrderLabelType = 'personal' | 'company' | 'important' | 'private'

export type OrderFolderType = 'inbox' | 'sent' | 'draft' | 'starred' | 'spam' | 'trash'

export type RouteParams = {
  label?: string
  folder?: string
}

export type OrderLayoutType = RouteParams & {}

export type OrderAttachmentType = {
  url: string
  size: string
  fileName: string
  thumbnail: string
}

export type FieldMenuItems = {
  src: string
  name: string
  value: string
}

export type FetchOrderParamsType = { q: string; folder: OrderFolderType; label: OrderLabelType }

export type PaginateOrderParamsType = { dir: 'next' | 'previous'; orderId: number }

export type UpdateOrderParamsType = {
  orderIds: number[] | number | []
  dataToUpdate: { folder?: OrderFolderType; isStarred?: boolean; isRead?: boolean; label?: OrderLabelType }
}

export type UpdateOrderLabelType = {
  label: OrderLabelType
  orderIds: number[] | number | []
}

export type OrderFromType = {
  name: string
  order: string
  avatar: string
}

export type OrderToType = {
  name: string
  order: string
}

export type OrderMetaType = {
  spam: number
  inbox: number
  draft: number
}

export type OrderType = {
  id: number
  message: string
  subject: string
  isRead: boolean
  to: OrderToType[]
  cc: string[] | []
  isStarred: boolean
  bcc: string[] | []
  from: OrderFromType
  time: Date | string
  replies: OrderType[]
  hasNextOrder?: boolean
  folder: OrderFolderType
  labels: OrderLabelType[]
  hasPreviousOrder?: boolean
  attachments: OrderAttachmentType[]
}

export type OrderFoldersArrType = {
  icon: ReactElement
  name: OrderFolderType
}
export type OrderFoldersObjType = {
  [key: string]: any[]
}

export type OrderStore = {
  mails: OrderType[] | null
  selectedOrders: number[]
  currentOrder: null | OrderType
  mailMeta: null | OrderMetaType
  filter: {
    q: string
    label: string
    folder: string
  }
}

export type OrderLabelColors = {
  personal: string
  company: string
  private: string
  important: string
}

export type OrderSidebarType = {
  hidden: boolean
  store: OrderStore
  lgAbove: boolean
  dispatch: Dispatch<any>
  leftSidebarOpen: boolean
  leftSidebarWidth: number
  mailDetailsOpen: boolean
  toggleComposeOpen: () => void
  handleLeftSidebarToggle: () => void
  setOrderDetailsOpen: (val: boolean) => void
  handleSelectAllOrder: (val: boolean) => void
}

export type OrderLogType = {
  query: string
  hidden: boolean
  store: OrderStore
  lgAbove: boolean
  dispatch: Dispatch<any>
  direction: 'ltr' | 'rtl'
  orderDetailsOpen: boolean
  routeParams: RouteParams
  labelColors: OrderLabelColors
  setQuery: (val: string) => void
  handleLeftSidebarToggle: () => void
  getCurrentOrder: (id: number) => void
  handleSelectOrder: (id: number) => void
  setOrderDetailsOpen: (val: boolean) => void
  handleSelectAllOrder: (val: boolean) => void
  updateOrder: (data: UpdateOrderParamsType) => void
  updateOrderLabel: (data: UpdateOrderLabelType) => void
  paginateOrder: (data: PaginateOrderParamsType) => void
}

export type OrderDetailsType = {
  mail: OrderType
  hidden: boolean
  dispatch: Dispatch<any>
  direction: 'ltr' | 'rtl'
  mailDetailsOpen: boolean
  routeParams: RouteParams
  labelColors: OrderLabelColors
  folders: OrderFoldersArrType[]
  foldersObj: OrderFoldersObjType
  setOrderDetailsOpen: (val: boolean) => void
  updateOrder: (data: UpdateOrderParamsType) => void
  paginateOrder: (data: PaginateOrderParamsType) => void
  handleStarOrder: (e: SyntheticEvent, id: number, value: boolean) => void
  handleLabelUpdate: (id: number | number[], label: OrderLabelType) => void
  handleFolderUpdate: (id: number | number[], folder: OrderFolderType) => void
}

export type OrderComposeType = {
  mdAbove: boolean
  composeOpen: boolean
  toggleComposeOpen: () => void
  composePopupWidth: number | string
}
