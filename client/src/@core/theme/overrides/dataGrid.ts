// ** Type Import
import { OwnerStateThemeType } from './'

const DataGrid = () => {
  return {
    MuiDataGrid: {
      // Compact rows: more of the list on screen at once.
      defaultProps: {
        rowHeight: 42,
        columnHeaderHeight: 42
      },
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          border: 0,
          color: theme.palette.text.primary,
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none'
          }
        }),
        toolbarContainer: ({ theme }: OwnerStateThemeType) => ({
          paddingRight: `${theme.spacing(6)} !important`,
          paddingLeft: `${theme.spacing(3.25)} !important`
        }),
        columnHeaders: ({ theme }: OwnerStateThemeType) => ({
          backgroundColor: theme.palette.customColors.tableHeaderBg,
          borderBottom: `1px solid ${theme.palette.divider}`
        }),
        columnHeader: ({ theme }: OwnerStateThemeType) => ({
          '&:not(.MuiDataGrid-columnHeaderCheckbox)': {
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
            '&:first-of-type': {
              paddingLeft: theme.spacing(4)
            }
          },
          '&:last-of-type': {
            paddingRight: theme.spacing(4)
          }
        }),
        columnHeaderCheckbox: {
          maxWidth: '58px !important',
          minWidth: '58px !important'
        },
        columnHeaderTitleContainer: {
          padding: 0
        },
        columnHeaderTitle: ({ theme }: OwnerStateThemeType) => ({
          fontWeight: 600,
          color: theme.palette.text.primary,
          letterSpacing: 0,
          textTransform: 'none',
          fontSize: theme.typography.body2.fontSize
        }),
        columnSeparator: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.divider
        }),
        row: {
          '&:last-child': {
            '& .MuiDataGrid-cell': {
              borderBottom: 0
            }
          }
        },
        cell: ({ theme }: OwnerStateThemeType) => ({
          borderColor: theme.palette.divider,
          fontWeight: 500,
          '&:not(.MuiDataGrid-cellCheckbox)': {
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
            '&:first-of-type': {
              paddingLeft: theme.spacing(4)
            }
          },
          '&:last-of-type': {
            paddingRight: theme.spacing(4)
          },
          // Row buttons (Edit, Delete, ...) sized to fit the compact rows.
          '& .MuiButton-root': {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
            fontSize: theme.typography.body2.fontSize
          },
          '&:focus, &:focus-within': {
            outline: 'none'
          }
        }),
        cellCheckbox: {
          maxWidth: '58px !important',
          minWidth: '58px !important'
        },
        editInputCell: ({ theme }: OwnerStateThemeType) => ({
          padding: 0,
          color: theme.palette.text.primary,
          '& .MuiInputBase-input': {
            padding: 0
          }
        }),
        footerContainer: ({ theme }: OwnerStateThemeType) => ({
          borderTop: `1px solid ${theme.palette.divider}`,
          '& .MuiTablePagination-toolbar': {
            paddingLeft: `${theme.spacing(4)} !important`,
            paddingRight: `${theme.spacing(4)} !important`
          },
          '& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
            color: theme.palette.text.primary
          }
        }),
        selectedRowCount: ({ theme }: OwnerStateThemeType) => ({
          margin: 0,
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4)
        })
      }
    }
  }
}

export default DataGrid
