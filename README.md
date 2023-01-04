
# json-sort-ci

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

### options

- **--dry-run** <sup>optional</sup> <br>
if true jsut return error when files are not sorted, if false (default) the files will be locally sorted.
---
- **--excludes** <sup>optional</sup> <br>
array of json file you don't want to sort
---
