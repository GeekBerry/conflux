
----------
# sign




## sign.sha3



### Parameters

Name   | Type   | Required | Default | Description
-------|--------|----------|---------|------------
buffer | Buffer | true     |         |

### Return

`Buffer` 


## sign.rlpEncode



### Parameters

Name  | Type           | Required | Default | Description
------|----------------|----------|---------|------------
array | Array.<Buffer> | true     |         |

### Return

`Buffer` 


## sign.randomBuffer

gen a random buffer with `size` bytes.

> Note: call `crypto.randomBytes`

### Parameters

Name | Type   | Required | Default | Description
-----|--------|----------|---------|------------
size | number | true     |         |

### Return

`Buffer` 


## sign.randomPrivateKey



### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|------------
entropy | Buffer | true     |         |

### Return

`Buffer` 


## sign.publicKeyToAddress



### Parameters

Name      | Type   | Required | Default | Description
----------|--------|----------|---------|------------
publicKey | Buffer | true     |         |

### Return

`Buffer` 


## sign.privateKeyToAddress



### Parameters

Name       | Type   | Required | Default | Description
-----------|--------|----------|---------|------------
privateKey | Buffer | true     |         |

### Return

`Buffer` 


## sign.ecdsaSign



### Parameters

Name       | Type   | Required | Default | Description
-----------|--------|----------|---------|------------
hash       | Buffer | true     |         |
privateKey | Buffer | true     |         |

### Return

`object` ECDSA signature object.
- r {Buffer}
- s {Buffer}
- v {number}


## sign.ecdsaRecover



### Parameters

Name | Type   | Required | Default | Description
-----|--------|----------|---------|------------
hash | Buffer | true     |         |
r    | Buffer | true     |         |
s    | Buffer | true     |         |
v    | number | true     |         |

### Return

`Buffer` publicKey


## sign.encrypt



### Parameters

Name     | Type   | Required | Default | Description
---------|--------|----------|---------|------------
key      | Buffer | true     |         |
password | Buffer | true     |         |

### Return

`object` Encrypt info
- salt {Buffer}
- iv {Buffer}
- cipher {Buffer}
- mac {Buffer}


## sign.decrypt



### Parameters

Name           | Type   | Required | Default | Description
---------------|--------|----------|---------|------------
options        |        | true     |         |
options.salt   | Buffer | true     |         |
options.iv     | Buffer | true     |         |
options.cipher | Buffer | true     |         |
options.mac    | Buffer | true     |         |
password       | Buffer | true     |         |

### Return

`Buffer` 


----------
# transaction



## Transaction.hash


``


## Transaction.from


``


## Transaction.constructor

Signs a transaction. This account needs to be unlocked.

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|-----------------------------
options | object | true     |         | See `Transaction.rawOptions`

### Return

`Transaction` 


## Transaction.sign

Sign transaction and set 'r','s','v'.

### Parameters

Name       | Type   | Required | Default | Description
-----------|--------|----------|---------|------------------------
privateKey | string | true     |         | Private key hex string.

### Return

`void`


## Transaction.encode



### Parameters

Name             | Type    | Required | Default | Description
-----------------|---------|----------|---------|-----------------------------------------
includeSignature | boolean | false    | false   | Whether or not to include the signature.

### Return

`Buffer` 


## Transaction.serialize

Get the raw tx hex string.

### Parameters

`void`

### Return

`Buffer` 


## Transaction.sendOptions



### Parameters

Name             | Type                      | Required | Default | Description
-----------------|---------------------------|----------|---------|----------------------------------------------------------------------------------------------------
options          | object                    | true     |         |
options.from     | string                    | true     |         | The address the transaction is send from.
options.nonce    | string\|number            | true     |         | This allows to overwrite your own pending transactions that use the same nonce.
options.gasPrice | string\|number            | true     |         | The gasPrice used for each paid gas.
options.gas      | string\|number\|BigNumber | true     |         | The gas provided for the transaction execution. It will return unused gas.
options.to       | string                    | false    |         | The address the transaction is directed to.
options.value    | string\|number\|BigNumber | false    |         | the value sent with this transaction
options.data     | string\|Buffer            | false    | ''      | The compiled code of a contract OR the hash of the invoked method signature and encoded parameters.

### Return

`object` Formatted send transaction options object.


## Transaction.callOptions



### Parameters

Name             | Type                      | Required | Default | Description
-----------------|---------------------------|----------|---------|-------------------------------------------------------------------------------------------------------------------------------
options          | object                    | true     |         |
options.from     | string                    | false    |         | The address the transaction is sent from.
options.nonce    | string\|number            | false    |         | The caller nonce (transaction count).
options.gasPrice | string\|number            | false    |         | The gasPrice used for each paid gas.
options.gas      | string\|number\|BigNumber | false    |         | The gas provided for the transaction execution. `call` consumes zero gas, but this parameter may be needed by some executions.
options.to       | string                    | true     |         | The address the transaction is directed to.
options.value    | string\|number\|BigNumber | false    |         | Integer of the value sent with this transaction.
options.data     | string\|Buffer            | false    |         | Hash of the method signature and encoded parameters.

### Return

`object` Formatted call contract options object.


## Transaction.rawOptions



### Parameters

Name             | Type                      | Required | Default | Description
-----------------|---------------------------|----------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------
options          | object                    | true     |         |
options.nonce    | string\|number            | true     |         | This allows to overwrite your own pending transactions that use the same nonce.
options.gasPrice | string\|number            | true     |         | The price of gas for this transaction in drip.
options.gas      | string\|number            | true     |         | The amount of gas to use for the transaction (unused gas is refunded).
options.to       | string                    | false    |         | The destination address of the message, left undefined for a contract-creation transaction.
options.value    | string\|number\|BigNumber | false    | 0       | The value transferred for the transaction in drip, also the endowment if it’s a contract-creation transaction.
options.data     | string\|Buffer            | false    | ''      | Either a ABI byte string containing the data of the function call on a contract, or in the case of a contract-creation transaction the initialisation code.
options.r        | string\|Buffer            | false    |         | ECDSA signature r
options.s        | string\|Buffer            | false    |         | ECDSA signature s
options.v        | string\|number            | false    |         | ECDSA recovery id

### Return

`object` Formatted sign transaction options object.


----------
# type



## type.EpochNumber.EARLIEST

The earliest epochNumber where the genesis block in.
`string`


## type.EpochNumber.LATEST_STATE

The latest epochNumber where the latest block with an executed state in.
`string`


## type.EpochNumber.LATEST_MINED

The latest epochNumber where the latest mined block in.
`string`


## type.Hex



### Parameters

Name  | Type                                          | Required | Default | Description
------|-----------------------------------------------|----------|---------|-----------------------------
value | string\|number\|Buffer\|Date\|BigNumber\|null | true     |         | The value to gen hex string.

### Return

`string` Hex string.


## type.Hex.isHex

Check if is hex string.

> Hex: /^0x([0-9a-f][0-9a-f])*$/

### Parameters

Name | Type   | Required | Default | Description
-----|--------|----------|---------|-------------------
hex  | string | true     |         | Value to be check.

### Return

`boolean` 


## type.Hex.toBuffer



### Parameters

Name | Type   | Required | Default | Description
-----|--------|----------|---------|----------------
hex  | string | true     |         | The hex string.

### Return

`Buffer` 


## type.Drip



### Parameters

Name  | Type                              | Required | Default | Description
------|-----------------------------------|----------|---------|------------
value | string\|number\|Buffer\|BigNumber | true     |         |

### Return

`string` 


## type.Drip.fromGDrip

Get Drip hex string by GDrip value.

### Parameters

Name  | Type                      | Required | Default | Description
------|---------------------------|----------|---------|----------------
value | string\|number\|BigNumber | true     |         | Value in GDrip.

### Return

`string` Hex string in drip.


## type.Drip.fromCFX

Get Drip hex string by CFX value.

### Parameters

Name  | Type                      | Required | Default | Description
------|---------------------------|----------|---------|--------------
value | string\|number\|BigNumber | true     |         | Value in CFX.

### Return

`string` Hex string in drip.


## type.Drip.toGrip

Get `GDrip` from Drip.

### Parameters

Name  | Type                      | Required | Default | Description
------|---------------------------|----------|---------|------------
value | string\|number\|BigNumber | true     |         |

### Return

`BigNumber` 


## type.Drip.toCFX

Get `CFX` from Drip.

### Parameters

Name  | Type                      | Required | Default | Description
------|---------------------------|----------|---------|------------
value | string\|number\|BigNumber | true     |         |

### Return

`BigNumber` 


## type.PrivateKey



### Parameters

Name  | Type                              | Required | Default | Description
------|-----------------------------------|----------|---------|------------
value | string\|number\|Buffer\|BigNumber | true     |         |

### Return

`string` 


## type.Address



### Parameters

Name  | Type                              | Required | Default | Description
------|-----------------------------------|----------|---------|------------
value | string\|number\|Buffer\|BigNumber | true     |         |

### Return

`string` 


## type.EpochNumber



### Parameters

Name  | Type                              | Required | Default | Description
------|-----------------------------------|----------|---------|------------
value | string\|number\|Buffer\|BigNumber | true     |         |

### Return

`string` 


## type.BlockHash



### Parameters

Name  | Type                              | Required | Default | Description
------|-----------------------------------|----------|---------|------------
value | string\|number\|Buffer\|BigNumber | true     |         |

### Return

`string` 


## type.TxHash



### Parameters

Name  | Type                              | Required | Default | Description
------|-----------------------------------|----------|---------|------------
value | string\|number\|Buffer\|BigNumber | true     |         |

### Return

`string` 
