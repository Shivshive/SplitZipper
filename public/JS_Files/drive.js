
const drivelist = require('drivelist');
// const path = require('path');
var hddSpace = require('hdd-space');

let drives= [];

hddSpace(function (info) {
    console.log('hard disk space')
    console.log(info);
//    console.log( info.parts[0])
    console.log(info.parts)
    console.log(info.total)

    let drives_array = info.parts;
    let total_drives_size = info.total;

    drives_array.forEach((value,index)=>{

        showdrives(value,index);
    })

});


function showdrives(harddrive, index){

    let drive_info= {};
    drive_info.letter =  harddrive.letter;

    var drive_root_path = drive_info.letter+'\/';
    
    drive_info.index = index;

    let a = $('<a>').attr('href','#').addClass('nav-item').addClass('nav-link').addClass('drive_symbol').text(drive_info.letter+' Drive').attr('id','dirve_list_id');
    a.data("driverootpath",drive_info.letter+'/');
    a.attr('onclick', 'showFileList(\"'+drive_root_path+'\");');
    let navbar_sys_drive_list = $('.drive_list','.sys_directories').append(a);
}


// drivelist.list((error, drives) => {
//     if (error) {
//         throw error;
//     }

//     console.log('drives information')
//     console.log(drives);
// });
