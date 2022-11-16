// credits to https://rmannibucau.metawerx.net/post/build-war-npm

const fs = require('fs');
const archiver = require('archiver');

const out = 'dist/Signage.war';

const output = fs.createWriteStream(out);
const archive = archiver('zip', {});

output.on('finish', () => {
    console.log('war (' + out + ') ' + archive.pointer() + ' total bytes');
});

archive.pipe(output);
archive.directory('dist/', false);
archive.finalize();
