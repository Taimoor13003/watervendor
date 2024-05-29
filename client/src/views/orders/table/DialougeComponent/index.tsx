// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

const DialogComponent = ({ open, setOpen }: { open: boolean, setOpen: (param: boolean) => void }) => {
  // ** State

  return (
    <Fragment>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Are you sure you want to delete?</DialogTitle>
        <DialogContent>
          
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={() => setOpen(false)}>delete</Button>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default DialogComponent
