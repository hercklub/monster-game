import { PlayerRole, PlayerRoleId } from '@/types'
import { childRole } from './child'
import { sheriffRole } from './sheriff'
import { widowRole } from './widow'

export const roles: Record<PlayerRoleId, PlayerRole> = {
  child: childRole,
  sheriff: sheriffRole,
  widow: widowRole,
}

export const roleList: PlayerRole[] = [childRole, sheriffRole, widowRole]

export function getRole(id: string): PlayerRole | undefined {
  return roles[id as PlayerRoleId]
}
