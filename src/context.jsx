import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)
export const useFilters = () => useContext(Ctx)

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({ city: 'dhaka', date: '2040-10-10', scale: 'daily', scenario: 'ssp245' })
  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }))
  return <Ctx.Provider value={{ filters, set }}>{children}</Ctx.Provider>
}
