#!/usr/bin/env node

const sortJson = require('sort-json');
const yargs = require('yargs');
const fs = require('fs');
const _ = require('lodash');
const { hideBin } = require('yargs/helpers')
const { exec } = require("child_process");

yargs(hideBin(process.argv))
    .command('alpha [port]', 'start the server', (yargs) => {

    }, (argv) => {
        if (argv.files) {
            let ciCheckMode = argv['only-check'];

            argv.files.forEach( async (file) => {
                let jsonFile = await fs.readFileSync(file);
                let jsonContent = JSON.parse(jsonFile);
                let sortedJsonContent = sortJson(jsonContent, {});

                // No CI check mode. Just sort and update the given json file locally.
                if (ciCheckMode === false) {
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
            // const options1 = { ignoreCase: true, reverse: true };
            // const copy = sortJson(argv.files[0], options1);
            // console.log(copy);
            return 0;
        }

        return yargs.showHelp();
    })
    .option('files', {
        alias: 'f',
        type: 'array',
        description: 'array of json files to be sorted'
    })
    .option('only-check', {
        alias: 'oc',
        type: 'boolean',
        description: 'ci check mode, only checks if uploaded files are sorted',
        default: false,
    })
    .demandCommand()
    .help('h')
    .parse()
