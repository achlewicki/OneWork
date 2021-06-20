export interface CompanyModel {
  documentId?: string,
  name: string,
  address: {
    street: string,
    city: string,
    state: string,
    zip_code: string
  },
  mail: string,
  phone: string,
  valid: boolean,
}
