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
                unsortedOnly,
                indent,
                excludes,
            } = argv;

            if (excludes?.length > 0) {
                files = files.filter( file => !excludes.includes(/[^/]*$/.exec(file)[0]));
            }

            let unsortedFiles = [];
            let index = 0;
            await Promise.all(files.map(file => {
                index += 1;
                let jsonFile = fs.readFileSync(file);
                let jsonContent = JSON.parse(jsonFile);
                let sortedJsonContent = sortJson(jsonContent, {});

                // No CI check mode. Just sort and update the given json file locally.
                const fileName = `${file}`.bold.dim;
                if (dryRun === false) {
                    if (JSON.stringify(jsonContent) !== JSON.stringify(sortedJsonContent)) {
                        console.info(`[${index}] ${fileName} sorted`.yellow);
                        let formattedContent = JSON.stringify(sortedJsonContent, null, indent);
                        fs.writeFileSync(file, formattedContent)
                        unsortedFiles.push(file);
                    } else if (!unsortedOnly) {
                        console.info(`[${index}] ${fileName} is already sorted`.green);
                    }
                    return;
                }

                // CI check mode. Compare sorted file and local file.
                if (JSON.stringify(jsonContent) !== JSON.stringify(sortedJsonContent)) {
                    console.error(`[${index}] ${fileName} not sorted`.red);
                    unsortedFiles.push(file);
                } else if (!unsortedOnly) {
                    console.info(`[${index}] ${fileName} is sorted`.green);
                }
            }));


            if (unsortedFiles.length > 0) {
                if (dryRun) {
                    console.info(`\n${unsortedFiles.length} of ${files} file(s) not sorted`.red);
                     process.exit(1);
                }
                console.info(`\n${unsortedFiles.length} files sorted`.yellow.bold);
                process.exit(0);
            }

            console.info(`\nAll files (${files.length}) are sorted`.green.bold);
            process.exit(0);
        }

        return yargs.showHelp();
    })
    .positional("file", {
        type: "array",
        required: true,
    })
    .option('indent', {
        alias: 'i',
        type: 'integer',
        description: 'indents to apply when the file is formatted',
        default: 4,
    })
    .option('unsorted-only', {
        alias: 'u',
        type: 'boolean',
        description: 'only show output for unsorted files',
        default: false,
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
