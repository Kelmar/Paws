'use strict';

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { ENOENT } = require('constants');

const exists = promisify(fs.exists);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

function delItem(baseName, entry)
{
    let fullName = path.join(baseName, entry.name);

    if (entry.isDirectory())
        return delTree(name);
    else
    {
        console.log('rm: ' + fullName);
        return unlink(fullName);
    }
}

function delTree(name)
{
    return exists(name)
        .then(found =>
        {
            if (!found)
                return;
          
            return readdir(name, { withFileTypes: true })
                .then(entries => Promise.all(entries.map(e => delItem(name, e))))
                .then(() => console.log('rmdir: ' + name))
                .then(() => rmdir(name))
            ;
        })
}

exports.delTree = delTree;
