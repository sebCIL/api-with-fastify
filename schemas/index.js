export const loginPostSchema = {
  type: 'object',
  properties: {
    profil: { type: 'string' },
    password: { type: 'string' }
  },
  required: ["profil", "password"],
}

export const customersSchema = {
  type: "array",
  items: {
    type: 'object',
    properties: {
      number: { type: 'number' },
      last_name: { type: 'string' },
      initials: { type: 'string' },
      street: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      zip_code: { type: 'number' },
      command_limit: { type: 'number' },
      CHGCOD: { type: 'number' },
      BALDUE: { type: 'number' },
      CDTDUE: { type: 'number' }
    },
  }
}

export const customerSchema = {
  type: 'object',
  properties: {
    number: { type: 'number' },
    last_name: { type: 'string' },
    initials: { type: 'string' },
    street: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    zip_code: { type: 'number' },
    command_limit: { type: 'number' },
    CHGCOD: { type: 'number' },
    BALDUE: { type: 'number' },
    CDTDUE: { type: 'number' }
  },
}

export const createCustomerSchema = {
  type: 'object',
  properties: {
    number: { type: 'number' },
    last_name: { type: 'string' },
    initials: { type: 'string' },
    street: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    zip_code: { type: 'number' },
    command_limit: { type: 'number' },
    CHGCOD: { type: 'number' },
    BALDUE: { type: 'number' },
    CDTDUE: { type: 'number' }
  },
}

export const updateCustomerSchema = {
  type: 'object',
  properties: {
    last_name: { type: 'string' },
    initials: { type: 'string' },
    street: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    zip_code: { type: 'number' },
    command_limit: { type: 'number' },
    CHGCOD: { type: 'number' },
    BALDUE: { type: 'number' },
    CDTDUE: { type: 'number' }
  },
}

export const errorSchema = {
  type: "object",
  properties: {
    statusCode: { type: "number" },
    error: { type: "string" },
    message: { type: "string" },
  },
  required: ["statusCode", "error", "message"],
};