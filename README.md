## json-sort-ci

Json files sort cli to be used and checked in the ci/cd workflow.
Sort is alphabetically.

### install
```
npm i json-sort-ci
```

### usage
```
json-sort-ci **/*.json bin/*.json --dry-run=true --excludes=test.json
```

For all the options and examples, run

```
json-sort-ci -h
```

### options

- **--dry-run** <sup>optional</sup> <br>
  if true jsut return error when files are not sorted, if false (default) the files will be locally sorted.
- **--excludes** <sup>optional</sup> <br>
  array of json file you don't want to sort
- **--indent=<integer>** <sup>optional</sup> <br>
  When reformatting the files use <integer> amount of spaces for the indentation
  Only applies when not running with `--dry-run`
- **--unsorted-only** <sup>optional</sup> <br>
  Only show files that were sorted by the program in the output, to shorten the output
- **--force** <sup>optional</sup> <br>
  Also apply sorting to files that are already sorted. Useful in combination with `--indent`.
  Result is that these files will be reformatted.

### Deploy new version

Use the `deploy.sh` script
See `deploy.sh --help` for info
