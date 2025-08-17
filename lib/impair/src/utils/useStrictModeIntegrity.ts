import { useEffect, useRef, useState } from 'react'

export function useStrictModeIntegrity() {
  const [integrityReference, setIntegrityReference] = useState({})
  const strictCheck = useRef(true)
  strictCheck.current = true

  useEffect(() => {
    if (!strictCheck.current) {
      strictCheck.current = true
      setIntegrityReference({})
    }

    return () => {
      strictCheck.current = false
    }
  }, [])

  return integrityReference
}
