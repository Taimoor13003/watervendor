// ** React Import
import { forwardRef, ElementType } from 'react'

// ** MUI Import
import Paper from '@mui/material/Paper'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'

// CustomAutocomplete with simplified generics and correct typing
const CustomAutocomplete = forwardRef(
  <
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
  >(
    props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo, "div">, // Assuming default component is "div"
    ref: any
  ) => {
    return (
      <Autocomplete
        {...props}
        ref={ref}
        PaperComponent={(paperProps) => <Paper {...paperProps} className='custom-autocomplete-paper' />}
      />
    )
  }
) as typeof Autocomplete

export default CustomAutocomplete
