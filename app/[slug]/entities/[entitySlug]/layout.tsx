"use client"
import React, { Usable } from "react"

// EntityProvider removed - using stores and hooks instead

const EntitiesLayout = ({ children, params }: {
  children: React.ReactNode,
  params: Usable<{ entitySlug: string }>
}) => {
  const { entitySlug } = React.use(params)

  // TODO: Initialize entity data in store based on entitySlug
  console.log('Entity layout for slug:', entitySlug)

  return children
}

export default EntitiesLayout
