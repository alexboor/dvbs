#!/usr/bin/env node
const Backup = require('./lib/backup');

const [,, ...args] = process.argv;

let mod;

process.on( 'SIGTERM', () => {
    process.exit(0);
});


if (!args[0]) {
    console.error('You must define a command. See readme How To Use.');
    process.exit(1);
}


switch (args[0]) {
    case 'backup':
        mod = new Backup();
        break;
    default:
        break;
}

(async () => {
    try {
        let res = await mod.run(args.slice(1));

        console.log('Done!');
        process.exit();

    } catch(err) {
        console.error(err);
        process.exit(1);
    }
})();
