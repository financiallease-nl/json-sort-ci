#!/usr/bin/env node

require('colors');
const sortJson = require('sort-json');
const yargs = require('yargs');
const fs = require('fs');

yargs.command(
    "$0 <files> [dry-run][excludes]",
    "sort json alphabetically",
    async(args) => {
        const { argv } = args;
        let files = argv["_"];
        if (files.length > 0) {

            let {
                dryRun,
                unsortedOnly,
                indent,
                force,
                excludes,
            } = argv;

            if (excludes?.length > 0) {
                files = files.filter(file => !excludes.includes(/[^/]*$/.exec(file)[0]));
            }

            let unsortedFiles = [];
            let index = 0;
            await Promise.all(files.map(file => {
                index += 1;
                const jsonFile = fs.readFileSync(file);
                const jsonContent = JSON.parse(jsonFile);
                const sortedJsonContent = sortJson(jsonContent, {});
                const stringContent = JSON.stringify(jsonContent);
                const sortedStringContent = JSON.stringify(sortedJsonContent);


                // No CI check mode. Just sort and update the given json file locally.
                const fileName = `${file}`.bold.dim;
                let formattedContent = JSON.stringify(sortedJsonContent, null, indent);
                if (dryRun === false) {
                    if (force && stringContent === sortedStringContent) {
                        fs.writeFileSync(file, formattedContent)
                        console.info(`[${index}] ${fileName} sorted (forced)`.blue);
                        unsortedFiles.push(file);
                    } else if (stringContent !== sortedStringContent) {
                        console.info(`[${index}] ${fileName} sorted`.yellow);
                        fs.writeFileSync(file, formattedContent)
                        unsortedFiles.push(file);
                    } else if (!unsortedOnly) {
                        console.info(`[${index}] ${fileName} is already sorted`.green);
                    }
                    return;
                }

                // CI check mode. Compare sorted file and local file.
                if (stringContent !== sortedStringContent) {
                    console.error(`[DRYRUN][${index}] ${fileName} would be sorted`.red);
                    unsortedFiles.push(file);
                } else if (!unsortedOnly) {
                    console.info(`[DRYRUN][${index}] ${fileName} already sorted`.green);
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
    .positional("files", {
        type: "array",
        required: true,
    })
    .option('force', {
        alias: 'f',
        type: 'boolean',
        description: 'Forces every file to sort, also if it is already sorted',
        default: false,
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
        alias: 'd',
        type: 'boolean',
        description: 'only checks if uploaded files are sorted',
        default: false,
    })
    .option('excludes', {
        alias: 'x',
        type: 'array',
        description: 'excludes set with files name not wished to be sorted',
        default: false,
    })
    .usage("$0 <file> [dry-run] [excludes] [indent] [unsuported-only]")
    .help()
    .completion()
    .demandCommand()
    .parse()
    .argv
