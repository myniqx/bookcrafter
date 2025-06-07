"use client"
import React, { Usable } from "react"

import { EntityProvider } from "@/providers/entity-provider"


const EntitiesLayout = ({ children, params }: {
  children: React.ReactNode,
  params: Usable<{ entitySlug: string }>
}) => {
  const { entitySlug } = React.use(params)

  return (
    <EntityProvider entitySlug={entitySlug}>
      {children}
    </EntityProvider>
  )
}

export default EntitiesLayout
