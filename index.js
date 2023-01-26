#!/usr/bin/env node

require('colors');
const sortJson = require('sort-json');
const yargs = require('yargs');
const fs = require('fs');
const _ = require('lodash');
const { hideBin } = require('yargs/helpers')
const { exec } = require("child_process");

yargs(hideBin(process.argv))
    .command('$0 <file> [dry-run][excludes]', 'sort json alphabetically', async(yargs) => {
        const { argv } = yargs;
        let files = argv["_"];

        if (files) {

            let {
                dryRun,
                excludes,
            } = argv;

            if (excludes?.length > 0) {
                files = files.filter( file => !excludes.includes(/[^/]*$/.exec(file)[0]));
            }

            let errors = 0;
            await Promise.allSettled(files.map(async(file) => {
                let jsonFile = await fs.readFileSync(file);
                let jsonContent = JSON.parse(jsonFile);
                let sortedJsonContent = sortJson(jsonContent, {});

                // No CI check mode. Just sort and update the given json file locally.
                if (dryRun === false) {
                    if (JSON.stringify(jsonContent) !== JSON.stringify(sortedJsonContent)) {
                        throw new Error(`Something went wrong sorting ${file}`.red);
                    }
                    console.info(`${file} is sorted alphabetically!`.green);
                    return 0;
                }

                // CI check mode. Compare sorted file and local file.
                if (JSON.stringify(jsonContent) !== JSON.stringify(sortedJsonContent)) {
                    console.error(`${file} not sorted alphabetically`.red);
                    errors = errors + 1;
                } else {
                    console.info(`${file} is already sorted alphabetically`.green);
                }
            }));

            if (errors > 0) {
                throw new Error(`${errors} file(s) not ordered alphabetically`.red);
            }
            return errors;
        }

        return yargs.showHelp();
    })
    .positional("file", {
        type: "array",
        required: true,
    })
    .option('dry-run', {
        alias: 'dr',
        type: 'boolean',
        description: 'only checks if uploaded files are sorted',
        default: false,
    })
    .option('excludes', {
        alias: 'ex',
        type: 'array',
        description: 'excludes set with files name not wished to be sorted',
        default: false,
    })
    .demandCommand()
    .parse()
