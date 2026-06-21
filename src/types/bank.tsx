//the types for the bank module, which includes the BankService type for individual services offered by a bank, the Bank type for the overall bank information and configuration, and the request and response types for creating, updating and listing banks and their services
export type BankService = {
  id: number
  label: string
  optionDigit: number
  position: number
  menuLevelId: number
  operationType?: string
  code?: string
  menuHeader?: string
  parentId?: number
  parentLabel?: string
  bankAlias?: string
}
// the Bank type for the overall bank information and configuration, including details about the bank, its API endpoints, limits and services offered
export type Bank = {
  id: number
  bankName: string
  bankAlias: string
  bankUsername: string
  accountFormat?: string
  bankCategory: number
  bankSpecification?: string
  version?: string
  redirectIp?: string | null
  active?: boolean
  minValue?: string
  maxValue?: string
  bankTokenUrl?: string
  bankAccountLinkRequestUrl?: string
  bankAccountLinkValidateUrl?: string
  bankAccountListUrl?: string
  bankBalanceEnquiryUrl?: string
  bankCheckStatusUrl?: string
  bankFailedNotifUrl?: string
  bankToWalletTransferUrl?: string
  walletToBankTransferUrl?: string
  bankToBankTransferUrl?: string
  bankMiniStatementUrl?: string
  bankFeesUrl?: string
  miniStatementTreshold?: number
  otpValidity?: number
  services?: BankService[]
  createdAt?: string
  updatedAt?: string
}
// the request type for creating a bank, which includes all the necessary information and configuration for the bank, as well as an optional array of services to be created along with the bank
export type CreateBankRequest = {
  bankName: string
  bankAlias: string
  bankUsername: string
  bankPassword: string
  minValue: string
  maxValue: string
  accountFormat?: string
  bankCategory: number
  bankSpecification?: string
  version?: string
  redirectIp?: string | null
  bankTokenUrl?: string
  bankAccountLinkRequestUrl?: string
  bankAccountLinkValidateUrl?: string
  bankAccountListUrl?: string
  bankBalanceEnquiryUrl?: string
  bankCheckStatusUrl?: string
  bankFailedNotifUrl?: string
  bankToWalletTransferUrl?: string
  walletToBankTransferUrl?: string
  bankToBankTransferUrl?: string
  bankMiniStatementUrl?: string
  bankFeesUrl?: string
  miniStatementTreshold?: number
  otpValidity?: number
  services?: CreateServiceRequest[]
}

export type UpdateBankRequest = Partial<Omit<CreateBankRequest, 'bankPassword' | 'services'>>

export type CreateServiceRequest = {
  label: string
  code?: string
  optionDigit: number
  position: number
  menuLevelId: number
  operationType?: string
}

export type ListBanksResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: {
    items: Bank[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export type GetBankResponse = {
  status: {
    code: number
    message: string
    description?: string
  }
  data: Bank
}