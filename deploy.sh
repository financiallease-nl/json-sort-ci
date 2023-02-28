#!/usr/bin/env bash

RED=$(tput setaf 1)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
BOLD=$(tput bold)
RESET=$(tput sgr0)
PATTERN="^v(([0-9]+)\.([0-9]+)\.([0-9]+))(-(alpha|beta|rc)([0-9]+))?$"
CURRENT_VERSION="$(jq -r .version package.json)"
declare TAG
declare MESSAGE
declare FULL_VERSION
declare VERSION
declare MAJOR
declare MINOR
declare PATCH

error () {
  >&2 echo "${RED}${BOLD}[ERROR] $* ${RESET}"
  echo ""
}

warn () {
  >&2 echo "${YELLOW}${BOLD}[WARN]${RESET} $*"
  echo ""
}

info () {
  echo "${BLUE}${BOLD}[INFO]${RESET} $*"
  echo ""
}

usage () {
    cat <<-EOF
	Deploy a new git tag to the package repository

	Usage: $0 --tag vX.Y.Z --message "tag message"
	=====================

	Current version
	$CURRENT_VERSION

	Latest tags:
	$(git tag -l --sort=-v:refname | head -5)
	EOF
}

parseVersion () {
    if ! [[ "$1" =~ $PATTERN ]]; then
        error "Version '$1' should be pattern vX.Y.Z"
        usage
        exit 1
    fi
    FULL_VERSION=${BASH_REMATCH[0]}
    VERSION=${FULL_VERSION:1}
    MAJOR=${BASH_REMATCH[2]}
    MINOR=${BASH_REMATCH[3]}
    PATCH=${BASH_REMATCH[4]}
}


if [[ $# -lt 1 ]]; then
    usage
    exit 1
fi

for ARG in "$@"; do
    case "$ARG" in
        --tag)
            shift
            TAG="$1"
            ;;
        --message)
            shift
            MESSAGE="$1"
            ;;
        --help|-h)
            usage
            exit 0
            ;;
    esac
    shift
done

parseVersion $TAG
if [[ -z "$TAG" ]] || [[ -z "$VERSION" ]]; then
    usage
    exit 1
fi

if [[ "$(git rev-parse --abbrev-ref @)" != "main" ]]; then
    warn "You are trying to release from a branch other than 'main'"
    read -p "Are you sure you want to continue? [y/N] " RELEASE_NOT_MAIN
    if ! [[ "$RELEASE_NOT_MAIN" =~ ^[yY] ]]; then
        exit 2
    fi
fi

info "Verifying pre-release"
npm run lint

NEWEST_VERSION=$(echo -e "$CURRENT_VERSION\n$VERSION" | sort -V | tail -1)
if [[ "$NEWEST_VERSION" != "$VERSION" ]] || [[ "$VERSION" = "$CURRENT_VERSION" ]]; then
    error "Current version ($CURRENT_VERSION) is same or higher than the new tag ($VERSION)"
    exit 1
fi

INSTALL_DIR="/tmp/$(jq -r '.name' package.json)/$VERSION"
mkdir -p $INSTALL_DIR
PACKAGE_JSON=$INSTALL_DIR/package.json
PACKAGE_LOCK_JSON=$INSTALL_DIR/package-lock.json
jq -r --arg nv "$VERSION" '.version |= $nv' package.json > $PACKAGE_JSON
jq -r --arg nv "$VERSION" '.version |= $nv' package-lock.json > $PACKAGE_LOCK_JSON

echo ""

CURR=$(pwd)
cleanup () {
    cd $CURR
    rm -rf $INSTALL_DIR
}
## Use trap to clean up the environment on exit, quit or error
trap cleanup ERR SIGINT EXIT
## Change dir and run npm install to fix the files
pushd $INSTALL_DIR
info "Using npm install to apply updated version"
npm install --omit=dev
popd

mv $PACKAGE_JSON package.json
mv $PACKAGE_LOCK_JSON package-lock.json


if [[ $((`git --no-pager diff --minimal -- package{,-lock}.json | wc -l`)) -eq 0 ]]; then
    info "Nothing to do"
    exit 0
fi

cat <<- CHANGES
Please review the diff
-----8<-----------8<------
CHANGES
git --no-pager diff --minimal -- package{,-lock}.json
echo "-----8<-----------8<------"

read -p "Do the changes look good? [Y/n] " APPLY_CHANGES


if [[ "$APPLY_CHANGES" =~ ^[nN] ]]; then
    git checkout -- package{,-lock}.json
    exit 1
fi

git add package{,-lock}.json
git commit -m "[RELEASE] bump version: $CURRENT_VERSION -> $VERSION"

git tag $TAG -m "$MESSAGE"

read -p "Want to push the release right now? [y/N] " PUSH_RELEASE

if [[ "$PUSH_RELEASE" =~ ^[yY] ]]; then
    git push
    git push --tags
fi


