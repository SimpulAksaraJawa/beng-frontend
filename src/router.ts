// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/customer`
  | `/dashboard`
  | `/login`
  | `/orders`
  | `/orders/edit/:id`
  | `/orders/new`
  | `/product`
  | `/product/:id`
  | `/product/edit/:id`
  | `/product/new`
  | `/sales`
  | `/stock`
  | `/supplier`

export type Params = {
  '/orders/edit/:id': { id: string }
  '/product/:id': { id: string }
  '/product/edit/:id': { id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
