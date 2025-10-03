// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/adjustment`
  | `/adjustment/new`
  | `/customer`
  | `/dashboard`
  | `/orders`
  | `/orders/details`
  | `/orders/new`
  | `/product`
  | `/product/:id`
  | `/product/edit/:id`
  | `/product/new`
  | `/sales`
  | `/sales/details`
  | `/sales/new`
  | `/stock`
  | `/supplier`

export type Params = {
  '/product/:id': { id: string }
  '/product/edit/:id': { id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
