// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/adjustment`
  | `/adjustment/new`
  | `/customers`
  | `/customers/edit/:id`
  | `/customers/new`
  | `/home`
  | `/login`
  | `/orders`
  | `/orders/details`
  | `/orders/new`
  | `/permission`
  | `/product`
  | `/product/:id`
  | `/product/edit/:id`
  | `/product/new`
  | `/register`
  | `/sales`
  | `/sales/details`
  | `/sales/edit/:id`
  | `/sales/new`
  | `/stock`
  | `/stock/StockAnalytics`
  | `/suppliers`
  | `/suppliers/edit/:id`
  | `/suppliers/new`

export type Params = {
  '/customers/edit/:id': { id: string }
  '/product/:id': { id: string }
  '/product/edit/:id': { id: string }
  '/sales/edit/:id': { id: string }
  '/suppliers/edit/:id': { id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
