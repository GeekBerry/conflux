const { jsdocToMd } = require('csv-xlsx/jsdoc');

jsdocToMd('./packages/conflux-js-client/lib', './packages/conflux-js-client/lib/api.md');
jsdocToMd('./packages/conflux-js-client/src', './packages/conflux-js-client/api.md');
jsdocToMd('./packages/conflux-js-utils/src', './packages/conflux-js-utils/api.md');
