
# json-sort-ci

Json files sort cli to be used and checked in the ci/cd workflow.

### install
```
npm i json-sort-ci
```

### usage
```
json-sort-ci alpha --files=<FILE_NAME> --only-check=true
```

### options

- alpha: to sort alphapitically
- --files: array of json file you want to sort
- --only-check: if true jsut return error when files are not sorted, if false (default) the files will be locally sorted.
