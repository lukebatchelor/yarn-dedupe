const fix_duplicates = require('../modules/fix-duplicates');
const lockfile = require('@yarnpkg/lockfile')

test('dedupes lockfile to max compatible version', () => {
  const yarn_lock = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


lodash@>=1.0.0:
  version "1.3.1"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-1.3.1.tgz#a4663b53686b895ff074e2ba504dfb76a8e2b770"

lodash@>=2.0.0:
  version "4.17.4"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.4.tgz#78203a4d1c328ae1d86dca6460e369b57f4055ae"
`

  const deduped = fix_duplicates(yarn_lock);
  const json = lockfile.parse(deduped).object;

  expect(json['lodash@>=1.0.0']['version']).toEqual('4.17.4');
  expect(json['lodash@>=2.0.0']['version']).toEqual('4.17.4');
});

test('downgrades if lower compatible version is pinned', () => {
  const yarn_lock = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


lodash@>=1.0.0:
  version "4.17.4"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.4.tgz#78203a4d1c328ae1d86dca6460e369b57f4055ae"

lodash@^3.0.0:
  version "3.10.1"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-3.10.1.tgz#5bf45e8e49ba4189e17d482789dfd15bd140b7b6"
`

  const deduped = fix_duplicates(yarn_lock);
  const json = lockfile.parse(deduped).object;

  expect(json['lodash@>=1.0.0']['version']).toEqual('3.10.1');
  expect(json['lodash@^3.0.0']['version']).toEqual('3.10.1');
});

test('limits the packages to be de-duplicated', () => {
  const yarn_lock = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


a-package@^2.0.0:
  version "2.0.0"
  resolved "http://example.com/a-package/2.1.0"

a-package@^2.0.1:
  version "2.0.1"
  resolved "http://example.com/a-package/2.2.0"

other-package@^1.0.0:
  version "1.0.11"
  resolved "http://example.com/other-package/1.0.0"

other-package@^1.0.1:
  version "1.0.12"
  resolved "http://example.com/other-package/1.0.0"
`

  const deduped = fix_duplicates(yarn_lock, ["other-package"]);
  const json = lockfile.parse(deduped).object;

  expect(json['a-package@^2.0.0']['version']).toEqual('2.0.0');
  expect(json['a-package@^2.0.1']['version']).toEqual('2.0.1');
  expect(json['other-package@^1.0.0']['version']).toEqual('1.0.12');
  expect(json['other-package@^1.0.1']['version']).toEqual('1.0.12');
});
