const packager = require('electron-packager')
const path = require('path');
const options = {
    dir : ".",
    icon: path.join(__dirname, "public", "img", "icon.ico")
};

packager(options)
  .then(appPaths => { 
      console.log(appPaths)
  })