const lodash = require('lodash');
const BigNumber = require('bignumber.js');

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

function parse(schema) {
  if (Array.isArray(schema)) {
    const func = parse(schema[0]);
    return arr => lodash.isNil(arr) ? arr : arr.map(func);
  }

  if (lodash.isPlainObject(schema)) {
    const parseTable = lodash.mapValues(schema, parse);
    return (obj) => {
      if (lodash.isNil(obj)) {
        return obj;
      }

      const result = lodash.mapValues(obj, (value, key) => {
        const func = parseTable[key];
        return func ? func(value) : value;
      });

      return lodash.pickBy(result, v => v !== undefined);
    };
  }

  if (lodash.isFunction(schema)) {
    return value => lodash.isNil(value) ? value : schema(value);
  }

  throw new Error(`unknown schema type ${typeof schema}`);
}

// ----------------------------------------------------------------------------
parse.boolean = parse(v => Boolean(Number(v)));
parse.number = parse(Number);
parse.bigNumber = parse(BigNumber);

parse.block = parse({
  epochNumber: parse.number,
  stable: parse.boolean,
  nonce: parse.number,
  height: parse.number,
  size: parse.number,
  timestamp: parse.number,
  gasLimit: parse.bigNumber,
  difficulty: parse.bigNumber,
  transactions: parse([v => (lodash.isObject(v) ? parse.transaction(v) : v)]),
});

parse.transaction = parse({
  transactionIndex: parse.number,
  nonce: parse.number,
  value: parse.bigNumber,
  gasPrice: parse.bigNumber,
  gas: parse.bigNumber,
  status: parse.number, // XXX: might be remove in rpc returned
  v: parse.number,
});

parse.receipt = parse({
  index: parse.number, // XXX: number already in rpc return
  epochNumber: parse.number, // XXX: number already in rpc return
  outcomeStatus: parse.number, // XXX: number already in rpc return
  gasUsed: parse.bigNumber,
});

module.exports = parse;
