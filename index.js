#!/usr/bin/env node

const sortJson = require('sort-json');
const yargs = require('yargs');
const fs = require('fs');
const _ = require('lodash');
const { hideBin } = require('yargs/helpers')
const { exec } = require("child_process");

yargs(hideBin(process.argv))
    .command('$0 <file> [dry-run][excludes]', 'sort json alphabetically', yargs => {
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

            files.forEach( async (file) => {
                let jsonFile = await fs.readFileSync(file);
                let jsonContent = JSON.parse(jsonFile);
                let sortedJsonContent = sortJson(jsonContent, {});

                // No CI check mode. Just sort and update the given json file locally.
                if (dryRun === false) {
                    exec(`sort-json ${file}`, (error) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                        }
                    });

                    return 0;
                }

                // CI check mode. Compare sorted file and local file.
                if (JSON.stringify(jsonContent) !== JSON.stringify(sortedJsonContent)) {
                    throw new Error(`${file} not sorted alphabetically`);
                }

                console.info(`${file} is already sorted alphabetically`);
                return 0;
            });

            return 0;
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
