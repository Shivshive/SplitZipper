const fs = require('fs')
const path = require('path')
// const jet = require('fs-jet')

const hide_zip_complete = require(path.join(__dirname,'public','JS_Files','zipFolder.js'));

let current_breadcrumb_path;
let selected_rows=[];

$(document).on('change', '#path', (eve) => {
    var element = document.getElementById('path')
    // alert('file path : ' + element.files[0].path);
    let zip_dir_path = element.files[0].path
    console.log(zip_dir_path)
   
    showFileList(zip_dir_path);
})

function showFileList(pathx) {
    displayModal(pathx, getFileInfoFromFolder(pathx));

    //Show breadcrumb
    showbreadcrumb(pathx);

    hide_zip_complete();
}

function showbreadcrumb(dirpath) {

    current_breadcrumb_path = dirpath;
    if(selected_rows){
        selected_rows.splice(0,selected_rows.length);
    }

    let breadcrumb_path = dirpath.split(path.sep);
    if(  $('#copy-button').text() == 'Copied !'){
        $('#copy-button').text('Copy !')
    }
    const ol_breadcrumb = $('.dir_breadcrumb');
    ol_breadcrumb.empty();
    let prev_value;
    breadcrumb_path.forEach((value, index) => {
        let current_path;
        if(index==0){
            current_path = value+'\\';
        }
        else{
            current_path = path.join(prev_value,value);
        }
        
        const a = $('<a>').attr('href', '#').text(value).data('current_path', current_path).addClass('path_breadcrumb');
        const li = $('<li>').addClass('breadcrumb-item').append(a);
        ol_breadcrumb.append(li);

        prev_value = current_path;

        a.on('click',(eve)=>{
            console.log('clicked....'+ value);
            showFileList(a.data('current_path'));
        })
    })

}

function displayModal(dirpath, dircontent) {

    const table = $('table')
    const tbody = $('tbody', 'table')

    $('tbody', 'table').empty()

    dircontent.forEach((value, index) => {

        const tr = $('<tr>')
        const th = $('<th>').attr('scope', 'row')
        let td_filename = $('<td>')
        const td_filepath = $('<td>').text(path.join(dirpath, value.name))
        let td_filesize


            if (value.fileSizeInBytes) {

                let filesize = convertToMegaByte(value.fileSizeInBytes)

                td_filename.text(value.name);
                td_filesize = $('<td>').text(filesize.size).addClass('size_fld_hd_')

            }
            else {

                try{

                    if (fs.statSync(path.join(dirpath, value.name)).isDirectory()) {

                        let dir_link = $('<a>').attr('href', '#').text(value.name);
                        td_filename.append(dir_link);
                        td_filesize = $('<td>').text('...');
    
                    }
                    else {
                        td_filename.text(value.name);
                        td_filesize.text(value.fileSizeInBytes + ' Bytes');
                    }
    

                }catch(ex){

                }

               
                td_filename.on('click', function () {
                    let folderPath = td_filepath.text();
                    showFileList(folderPath);
                });
            }


       

        // tr.append(th)
        const input_checkbox = $('<input>').attr('type','checkbox')
        const td_checkbox = $('<td>').addClass('checkbox_fld_hd_')
        td_checkbox.append(input_checkbox)
        tr.append(td_checkbox)
        tr.append(td_filename.addClass('filename_fld_hd_'))
        // tr.append(td_filepath)
        tr.append(td_filesize)

        tbody.append(tr)

        input_checkbox.on("change",function(){

            let file_obj = {};
            if(this.checked == true){
                console.log(td_filename.text()+' is checked.'+' '+'path is : '+td_filepath.text());
                file_obj.name = td_filename.text();
                file_obj.path = td_filepath.text();
                selected_rows.push(file_obj);
            }
        })

    })
}


function getFileInfoFromFolder(route) {
    const files = fs.readdirSync(route, 'utf8');
    let response = [];
    const directory_array = [];
    const file_array = [];
    for (let file of files) {
       
        try {
            const extension = path.extname(file);
            let fileSizeInBytes = 0;
            fileSizeInBytes = fs.statSync(path.join(route, file)).size;
            let isDirectory = 0;
            if(fs.statSync(path.join(route,file)).isDirectory()){
                isDirectory = 1;
                directory_array.push({ name: file, extension, fileSizeInBytes, isDirectory: isDirectory });
            }else{
                file_array.push({ name: file, extension, fileSizeInBytes, isDirectory: isDirectory });
            }
            
        } catch (ex) {

        }
       
    }

    directory_array.sort((obj1, obj2)=>{

        let filename_1 = obj1.name.toLowerCase();
        let filename_2 = obj2.name.toLowerCase();

        if(obj1.filename_1 < obj2.filename_2)
            return -1
        
        if(obj1.filename_1 > obj2.filename_1)
            return 1
        return 0 //default return is 0

    });

    file_array.sort((obj1, obj2)=>{

        let filename_1 = obj1.name.toLowerCase();
        let filename_2 = obj2.name.toLowerCase();

        if(obj1.filename_1 < obj2.filename_2)
            return -1
        
        if(obj1.filename_1 > obj2.filename_1)
            return 1
        return 0 //default return is 0

    });

    response = jQuery.merge(directory_array,file_array);

    return response;
}


function convertToMegaByte(bytes) {

    let kb = bytes / 1000
    let mb
    if ((bytes / 1000000) > 1) {
        mb = kb / 1000
    }

    let filesize = {}

    if (mb) {
        filesize.size = mb + ' MB'
    }
    else {
        filesize.size = kb + ' KB'
    }

    return filesize;

}

$(document).on('click','#copy-button',()=>{
    if(current_breadcrumb_path){
        copy_path(current_breadcrumb_path);
    }

})