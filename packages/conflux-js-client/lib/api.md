

----------
# provider.base




## BaseProvider.constructor



### Parameters

Name            | Type   | Required | Default | Description
----------------|--------|----------|---------|-------------------------------
url             | string | true     |         | Full json rpc http url
options         | object | false    |         |
options.timeout | number | false    | 60*1000 | Request time out in ms
options.logger  | object | false    |         | Logger with `info` and `error`

### Return

`BaseProvider` 


## BaseProvider.requestId

Gen a random json rpc id.
It is used in `call` method, overwrite it to gen your own id.

### Parameters

`void`

### Return

`string` 


----------
# provider.http

Http protocol json rpc provider.


## HttpProvider.constructor



### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|-------------------------------
url     | string | true     |         | Full json rpc http url
options | object | false    |         | See `BaseProvider.constructor`

### Return

`HttpProvider` 

### Example

```
> const provider = new HttpProvider('http://testnet-jsonrpc.conflux-chain.org:12537', {logger: console});
```

## HttpProvider.call

Call a json rpc method with params

### Parameters

Name      | Type   | Required | Default | Description
----------|--------|----------|---------|------------------------
method    | string | true     |         | Json rpc method name.
...params | array  | false    |         | Json rpc method params.

### Return

`Promise.<*>` Json rpc method return value.

### Example

```
> await provider.call('cfx_epochNumber');> await provider.call('cfx_getBlockByHash', blockHash);
```

