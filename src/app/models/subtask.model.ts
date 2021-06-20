export interface SubtaskModel {
  documentId: string
  has_conditions?: boolean,
  status: string,
  subtask_description: string,
  conditions?: string []
}
