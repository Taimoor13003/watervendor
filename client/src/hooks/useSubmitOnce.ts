import { useCallback, useRef, useState } from 'react'

// A double click on Submit fired two saves before React could disable the
// button, creating duplicate customers and orders. Wrapping the form's submit
// handler with `once` ignores any submit while the previous one is still running.
export const useSubmitOnce = () => {
  const inFlight = useRef(false)
  const [submitting, setSubmitting] = useState(false)

  const once = useCallback(
    <A extends unknown[]>(handler: (...args: A) => Promise<unknown> | unknown) =>
      async (...args: A) => {
        const event = args[0] as { preventDefault?: () => void } | undefined
        event?.preventDefault?.()
        if (inFlight.current) return
        inFlight.current = true
        setSubmitting(true)
        try {
          await handler(...args)
        } finally {
          inFlight.current = false
          setSubmitting(false)
        }
      },
    []
  )

  return { once, submitting }
}
