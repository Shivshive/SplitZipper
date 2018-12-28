var ncp = require("copy-paste");

function copy_path(path) {

    ncp.copy(path, function () {
        $('#copy-button').text('Copied !')
    })

}
