const Wallet = require('../src/wallet');

const KEY = '0xa816a06117e572ca7ae2f786a046d2bc478051d0717bf5cc4f5397923258d393';
const ADDRESS = '0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b';

// ----------------------------------------------------------------------------
test('Wallet', () => {
  const wallet = new Wallet();
  expect(wallet.size).toBe(0);

  const accountNew = wallet.create();
  expect(wallet.size).toBe(1);

  const accountGet = wallet.get(accountNew.address);
  expect(accountGet.address).toBe(accountNew.address);
  expect(accountGet.privateKey).toBe(accountNew.privateKey);

  const accountAdd = wallet.add(KEY);
  expect(wallet.size).toBe(2);
  expect(accountAdd.privateKey).toBe(KEY);
  expect(accountAdd.address).toBe(ADDRESS);

  const accountDup = wallet.add(KEY);
  expect(wallet.size).toBe(2);
  expect(accountAdd.address).toBe(accountDup.address);
  expect(accountAdd.privateKey).toBe(accountDup.privateKey);

  const accountRemove = wallet.remove(accountNew.address);
  expect(accountRemove.address).toBe(accountNew.address);
  expect(accountRemove.privateKey).toBe(accountNew.privateKey);
  expect(wallet.size).toBe(1);

  const empty = wallet.remove(accountNew.address);
  expect(empty).toBe(undefined);
  expect(wallet.size).toBe(1);

  wallet.clear(accountNew.address);
  expect(wallet.size).toBe(0);
});

test('Wallet.Account', () => {
  const account = new Wallet.Account(KEY);
  expect(account.privateKey).toBe(KEY);
  expect(account.address).toBe(ADDRESS);

  const info = account.encrypt('password');
  const loadAccount = Wallet.Account.decrypt(info, 'password');

  expect(loadAccount.privateKey).toBe(account.privateKey);
  expect(loadAccount.address).toBe(account.address);
});
