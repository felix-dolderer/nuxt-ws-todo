import { db } from "./connection"
import {
  auditLogsTable,
  type actionEnum,
  type resourceTypeEnum,
} from "./schema"

type AddAuditLogData = {
  resourceType: (typeof resourceTypeEnum.enumValues)[number]
  resourceId: number
  action: (typeof actionEnum.enumValues)[number]
  data: unknown
}

type TransactionType = Parameters<Parameters<(typeof db)["transaction"]>[0]>[0]

export async function dbAddAuditLog(
  tx: TransactionType,
  addAuditLogData: AddAuditLogData,
) {
  await tx.insert(auditLogsTable).values(addAuditLogData)
}
