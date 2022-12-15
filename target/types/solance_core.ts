export type SolanceCore = {
  "version": "0.1.0",
  "name": "solance_core",
  "instructions": [
    {
      "name": "taskCreateAndIssueCond",
      "accounts": [
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "hashedSeed",
          "type": "string"
        },
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "createPool",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "xToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "yToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srcXAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "srcYAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "xTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "yTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "x",
          "type": "u64"
        },
        {
          "name": "y",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swap",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "srcXAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dstYAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "xTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "yTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "xToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "yToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "a",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "profileUrl",
          "type": "string"
        },
        {
          "name": "userRole",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "x",
            "type": "u64"
          },
          {
            "name": "xToken",
            "type": "publicKey"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "yToken",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "task",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "hashedSeed",
            "type": "string"
          },
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "state",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userName",
            "type": "string"
          },
          {
            "name": "userRole",
            "type": "string"
          },
          {
            "name": "userWalletAddress",
            "type": "publicKey"
          },
          {
            "name": "userProfileImageUrl",
            "type": "string"
          },
          {
            "name": "jobCount",
            "type": "u64"
          },
          {
            "name": "index",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreatePoolEvent",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "x",
          "type": "u64",
          "index": false
        },
        {
          "name": "xToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "y",
          "type": "u64",
          "index": false
        },
        {
          "name": "yToken",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "SwapEvent",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "a",
          "type": "u64",
          "index": false
        },
        {
          "name": "b",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Overflow",
      "msg": "Operation overflowed"
    },
    {
      "code": 6001,
      "name": "InvalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6002,
      "name": "NoBump",
      "msg": "Cannot find treasurer account"
    }
  ]
};

export const IDL: SolanceCore = {
  "version": "0.1.0",
  "name": "solance_core",
  "instructions": [
    {
      "name": "taskCreateAndIssueCond",
      "accounts": [
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "hashedSeed",
          "type": "string"
        },
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "createPool",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "xToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "yToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srcXAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "srcYAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "xTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "yTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "x",
          "type": "u64"
        },
        {
          "name": "y",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swap",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "srcXAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dstYAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "xTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "yTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "xToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "yToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "a",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "profileUrl",
          "type": "string"
        },
        {
          "name": "userRole",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "x",
            "type": "u64"
          },
          {
            "name": "xToken",
            "type": "publicKey"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "yToken",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "task",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "hashedSeed",
            "type": "string"
          },
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "state",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userName",
            "type": "string"
          },
          {
            "name": "userRole",
            "type": "string"
          },
          {
            "name": "userWalletAddress",
            "type": "publicKey"
          },
          {
            "name": "userProfileImageUrl",
            "type": "string"
          },
          {
            "name": "jobCount",
            "type": "u64"
          },
          {
            "name": "index",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreatePoolEvent",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "x",
          "type": "u64",
          "index": false
        },
        {
          "name": "xToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "y",
          "type": "u64",
          "index": false
        },
        {
          "name": "yToken",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "SwapEvent",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "a",
          "type": "u64",
          "index": false
        },
        {
          "name": "b",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Overflow",
      "msg": "Operation overflowed"
    },
    {
      "code": 6001,
      "name": "InvalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6002,
      "name": "NoBump",
      "msg": "Cannot find treasurer account"
    }
  ]
};
