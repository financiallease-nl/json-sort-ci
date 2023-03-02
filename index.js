#!/usr/bin/env node

require("colors");
const sortJson = require("@financiallease-nl/sort-json");
const yargs = require("yargs");
const fs = require("fs");

const usage = "$0 <file> <file> [--dry-run] [--excludes EXCLUDES] [--indent N] [--ignore-case] [ --secondary-sort-by-value] [--unsorted-only] [--help]";
const description = require("./package.json").description;

yargs.command(
    usage,
    description,
    async (args) => {
        const { argv } = args;
        let files = argv["_"];
        if (files.length > 0) {

            let {
                dryRun,
                unsortedOnly,
                indent,
                force,
                excludes,
                ignoreCase,
                secondarySortByValue,
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
                const sortedJsonContent = sortJson(jsonContent, {
                    ignoreCase,
                    secondarySortByValue,
                });
                const stringContent = JSON.stringify(jsonContent);
                const sortedStringContent = JSON.stringify(sortedJsonContent);


                // No CI check mode. Just sort and update the given json file locally.
                const fileName = `${file}`.bold.dim;
                let formattedContent = JSON.stringify(sortedJsonContent, null, indent);
                if (dryRun === false) {
                    if (force && stringContent === sortedStringContent) {
                        fs.writeFileSync(file, formattedContent);
                        /* eslint-disable-next-line no-console */
                        console.info(`[${index}] ${fileName} sorted (forced)`.blue);
                        unsortedFiles.push(file);
                    } else if (stringContent !== sortedStringContent) {
                        /* eslint-disable-next-line no-console */
                        console.info(`[${index}] ${fileName} sorted`.yellow);
                        fs.writeFileSync(file, formattedContent);
                        unsortedFiles.push(file);
                    } else if (!unsortedOnly) {
                        /* eslint-disable-next-line no-console */
                        console.info(`[${index}] ${fileName} is already sorted`.green);
                    }
                    return;
                }

                // CI check mode. Compare sorted file and local file.
                if (stringContent !== sortedStringContent) {
                    /* eslint-disable-next-line no-console */
                    console.error(`[DRYRUN][${index}] ${fileName} would be sorted`.red);
                    unsortedFiles.push(file);
                } else if (!unsortedOnly) {
                    /* eslint-disable-next-line no-console */
                    console.info(`[DRYRUN][${index}] ${fileName} already sorted`.green);
                }
            }));


            if (unsortedFiles.length > 0) {
                if (dryRun) {
                    /* eslint-disable-next-line no-console */
                    console.info(`\n${unsortedFiles.length} of ${files} file(s) not sorted`.red);
                    process.exit(1);
                }
                /* eslint-disable-next-line no-console */
                console.info(`\n${unsortedFiles.length} files sorted`.yellow.bold);
                process.exit(0);
            }

            /* eslint-disable-next-line no-console */
            console.info(`\nAll files (${files.length}) are sorted`.green.bold);
            process.exit(0);
        }
    })
    .positional("files", {
        type: "array",
        required: true,
    })
    .option("force", {
        alias: "f",
        type: "boolean",
        description: "Forces every file to sort, also if it is already sorted",
        default: false,
    })
    .option("indent", {
        alias: "n",
        type: "integer",
        description: "indents to apply when the file is formatted",
        default: 4,
    })
    .option("unsorted-only", {
        alias: "u",
        type: "boolean",
        description: "only show output for unsorted files",
        default: false,
    })
    .option("dry-run", {
        alias: "d",
        type: "boolean",
        description: "only checks if uploaded files are sorted",
        default: false,
    })
    .option("excludes", {
        alias: "x",
        type: "array",
        description: "excludes set with files name not wished to be sorted",
        default: false,
    })
    .option("secondary-sort-by-value", {
        alias: "s",
        description: "Sort arrays of objects with identical keys by their value as well",
        type: "boolean",
        default: false,
    })
    .option("ignore-case", {
        alias: "i",
        description: "Sort case-invariant",
        type: "boolean",
        default: false,
    })
    .help()
    .usage(usage)
    .completion()
    .demandCommand()
    .parse()
    .argv;
