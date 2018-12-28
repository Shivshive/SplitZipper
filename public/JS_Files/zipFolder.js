const archiver = require('archiver')
const getFolderSize = require('get-folder-size')
const sizeof = require('object-sizeof')
const path_parse = require('path-parse')




// let progressbar_container = $('#progressbar_ctr')
// let progressbar_width = $('#progress_bar_progress')
// let percentage_header = $('#percentage')
// let percentage_container = $('#prog_per')

// let container_gridrow = $('.grid , .progressbar_grid');

// UI Elements Information Bar --

// Mmain_container_pb
let main_container_pb = $('#main_container_pb');

// Progress bar flex -- 
let progress_bar_container = $('#p_b_ctrl');
let progress = $('.progress');
let progress_bar = $('.progress-bar');
let zip_progress_label = $('#zip_progress_label');

// file_name_container --
let file_name_container = $('#file_name_container');
let file_name_label = $('#file_name_label');
let filename_z = $('#filename');

// zip_complete_container
let zip_complete_container = $('#zip_complete_container');
let zip_complete = $('#zip_complete');

// information_bar_container
let information_bar_container = $('#information_bar_container');
// Row
let rows_selected = $('#rows_selected');
let row_no = $('#row_no');
// zip
let zipped_no = $('#zipped_no');
// remain
let remain_no = $('#remain_no');

// Modal

let modal = $('#Modal')


function hide_maincontainer_pb() {

    if (!(main_container_pb.hasClass('invisible'))) {
        main_container_pb.addClass('invisible');
    }
}

function hide_progress_bar_container() {

    if (!(progress_bar_container.hasClass('invisible'))) {

        progress_bar_container.addClass('invisible');

        if (!(progress.hasClass('invisible'))) {
            progress.addClass('invisible');
        }

        // if(!(progress_bar.hasClass('invisible'))){
        //     progress_bar.addClass('invisible');
        // }

        if (!(zip_progress_label.hasClass('invisible'))) {
            zip_progress_label.addClass('invisible');
        }

    }
}

function hide_filename_container() {

    if (!(file_name_container.hasClass('invisible'))) {

        file_name_container.addClass('invisible');
    }
}

function hide_Informationbar_container() {

    if (!(information_bar_container.hasClass('invisible'))) {
        information_bar_container.addClass('invisible');
    }
}

var hide_zip_complete_container = function () {

    if (!(zip_complete_container.hasClass('invisible'))) {

        zip_complete_container.addClass('invisible');
    }
}


// unhide ui
function unhide_maincontainer_pb() {

    if (main_container_pb.hasClass('invisible')) {
        main_container_pb.removeClass('invisible');
    }
}

function unhide_progress_bar_container() {

    if (progress_bar_container.hasClass('invisible')) {

        progress_bar_container.removeClass('invisible');

        if (progress.hasClass('invisible')) {
            progress.removeClass('invisible');
        }

        // if(!(progress_bar.hasClass('invisible'))){
        //     progress_bar.addClass('invisible');
        // }

        if (zip_progress_label.hasClass('invisible')) {
            zip_progress_label.removeClass('invisible');
        }

    }
}

function unhide_filename_container() {

    if (file_name_container.hasClass('invisible')) {

        file_name_container.removeClass('invisible');
    }
}

function unhide_Informationbar_container() {

    if (information_bar_container.hasClass('invisible')) {
        information_bar_container.removeClass('invisible');
    }
}

function unhide_zip_complete_container() {

    if (zip_complete_container.hasClass('invisible')) {

        zip_complete_container.removeClass('invisible');
    }
}


async function startzip_ui() {
    await hide_zip_complete_container();
    await unhide_maincontainer_pb();
    await unhide_Informationbar_container();
    await unhide_progress_bar_container();
}

async function endzip_ui() {
    // await hide_maincontainer_pb();
    await hide_Informationbar_container();
    await unhide_zip_complete_container();
    await hide_progress_bar_container();
}

async function resetInformationbar_values() {
    row_no.text(0);
    zipped_no.text(0);
    remain_no.text(0);
}

let percentage = 0;

async function zipFolder() {

    if (selected_rows) {

        console.log('No of rows selected : ' + selected_rows)
        await startzip_ui();
        await row_no.text(selected_rows.length);
        await remain_no.text(selected_rows.length);
        for (var file in selected_rows) {

            console.log(selected_rows[file].path);
            // await zip(selected_rows[0].path);
            await zipdir(selected_rows[file].path);
            zipped_no.text(file + 1);
            remain_no.text(selected_rows.length - (file + 1));
            // await container_gridrow.css('display','none');
            // await $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
            // await percentage_header.text('0');
            await updateProgress(0);
            await waitFor(2000);
        }

        selected_rows.length = 0;
        console.log('File Zipped: Selected Rows Array : ' + selected_rows.toString())
        await endzip_ui();
        await modal.modal('show');
        await resetInformationbar_values();
        // await waitFor(2000);      
    }

}

function waitFor(t) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // putting a wait...
            console.log('Timeout over');
            resolve();
        }, t);
    })
}


function output_Folder_Check(f){
    let system_drive = process.env.systemdrive;
    let username = process.env.username;
    let client_mc_desktop_path = path.normalize(system_drive+"\\Users\\"+username+"\\Desktop\\Zipped_Output_Folder");
    if(!(fs.existsSync(client_mc_desktop_path))){
        if(!(f)){
            if(!(fs.existsSync(path.join(client_mc_desktop_path,f)))){
                fs.mkdirSync(path.join(client_mc_desktop_path, f));
            }
        }
        else{
            fs.mkdirSync(path.join(client_mc_desktop_path));
        }

    }

    return client_mc_desktop_path;
}


// core logic to zip file/folder.....
function zip(src_zip_file, srcfile_folder) {

    return new Promise((resolve, reject) => {
        let filesize = 0
        let filename = path_parse(src_zip_file).name;
        let foldername = path_parse(srcfile_folder).name;
        let output_Folder = output_Folder_Check(foldername);

        const output_dir = path.join(output_Folder,filename + '.zip')

        // container_gridrow.fadeIn();

        if (progress_bar.hasClass('invisible') && file_name_container.hasClass('invisible')) {
            // updateProgress(0);
            // waitFor(2000);
            progress_bar.removeClass('invisible');
            file_name_container.removeClass('invisible');
            filename_z.text(filename);
        }

        let filesize_promise = new Promise((resolve, reject) => {
            getFolderSize(src_zip_folder, function (err, size) {
                resolve(size);
            })
        })

        let src_stream = fs.createReadStream(src_zip_file)

        filesize_promise.then((size) => {

            filesize = size;
            let previous_value;
            let current_value;

            var chunk_temp = 0;

            console.log('file size is : ' + converttomb(size) + ' mb' + ' ' + (size / 1024) + ' kb');

            var archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compres}
                //compression level.
            });
            const output = fs.createWriteStream(output_dir)
            let total_folder_sizze = 0

            archive.on('data', function (chunk) {
            })

            function converttomb(bytes) {
                return ((bytes / 1024) / 1024);
            }

            switch (fs.statSync(src_zip_folder).isDirectory()) {

                case true: archive.directory(src_zip_file, false);
                    break;

                case false: archive.append(src_stream, { name: 'file1.txt' })
                    break;
            }

            archive.pipe(output);
            archive.finalize();

            src_stream.on('open', () => {

            })

            src_stream.on('data', function (chunk) {
                chunk_temp = chunk_temp + chunk.byteLength
                var total_mb_processed = converttomb(chunk_temp)
                percentage = total_mb_processed * 100 / converttomb(filesize);
                updateProgress(percentage.toFixed(0));
            })

            output.on('finish', function () {
                console.log(src_zip_folder + ' zipped ---- ' + percentage + ' % complete \r');
                updateProgress(percentage.toFixed(0));
            });

            output.on('close', () => {
                waitFor(2000).then((t) => {
                    if (!(progress_bar.hasClass('invisible'))) {
                        progress_bar.addClass('invisible');
                        file_name_container.addClass('invisible');
                        filename_z.text('');
                    }
                    resolve();
                })
            })

            output.on('end', function () {
                console.log('Data has been drained');
            });

        })
        // function Callback(fn, args) {
        //     return new Promise((resolve, reject) => {
        //         fn.call(null, args, (err, data) => {
        //             if (err) {
        //                 reject(err);
        //             } else {
        //                 resolve(data);
        //             }
        //         });
        //     });
        // }

        // const stats = new Callback(fs.Stats, []);

        // stats.then(s => {

        // });
    })

}

function updateProgress(p) {
    progress_bar.css({ 'width': p + '%' });
    progress_bar.text(p + ' %');
}

function zipdir(srcdir, srcdir_folder) {

    return new Promise((resolve, reject) => {

        let percentage = 0;
        let entry;

        if (progress_bar.hasClass('invisible') && file_name_container.hasClass('invisible')) {

            progress_bar.removeClass('invisible');
            file_name_container.removeClass('invisible');
            filename_z.text(path_parse(srcdir).name + '/');

        }

        if (srcdir && fs.statSync(srcdir).isDirectory()) {

            // $('.progress').fadeIn()
            // percentage_container.fadeIn()

            // container_gridrow.fadeIn();
            let output_Folder = output_Folder_Check();
            
            var outputStream = fs.createWriteStream(path.join(output_Folder, path_parse(srcdir).name + '.zip'));

            var archivedir = archiver('zip', {
                zlib: { level: 9 }
            });

            archivedir.directory(srcdir, false).pipe(outputStream);
            archivedir.finalize();

            archivedir.on('pipe', () => {

            })

            archivedir.on('progress', (entries) => {
                // console.log('Processed : '+entries.entries.processed);
                // console.log('Total : '+entries.entries.total);
                entry = entries;
                percentage = (entries.entries.processed * 100 / entries.entries.total);
                updateProgress(percentage.toFixed(0));
            })

            archivedir.on('finish', () => {
                updateProgress(percentage.toFixed(0));

                console.log('Zipped ---- ' + percentage + ' % Completed..!');
                console.log('Zipped  - ' + srcdir);
                console.log('Total Files Processed : -- ' + entry.entries.processed);

                waitFor(2000).then((t) => {

                    if (!(progress_bar.hasClass('invisible'))) {
                        progress_bar.addClass('invisible');
                        file_name_container.addClass('invisible');
                        filename_z.text('');
                    }
                    resolve();
                })

            })

            archivedir.on('data', (chunk) => {
                updateProgress(percentage.toFixed(0));
            })
        }
        else {
            resolve();
        }
    })
}



async function zipSplitZipContent(srcMain) {

    let dirContent = fs.readdirSync(srcMain);
    for (let file in dirContent) {

        let filepath = path.join(srcMain, dirContent[file]);
        console.log('SubFile : ' + filepath);

        if (fs.statSync(filepath).isDirectory()) {

            await zipdir(filepath, src_folder);
        }
        else {
            await zip(filepath, src_folder);
        }

        // await container_gridrow.css('display','none');
        // await $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
        // await percentage_header.text('0');
        await updateProgress(0);
        await waitFor(2000);
    }

    return true;
}

async function splitZip_Selected() {

    if (selected_rows) {

        await console.log('No of rows selected : ' + selected_rows.length)
        startzip_ui();
        row_no.text(selected_rows.length);
        remain_no.text(selected_rows.length);
        for (var file in selected_rows) {

            await console.log('Row No : ' + (file + 1) + ' || Path : ' + selected_rows[file].path);
            await zipSplitZipContent(selected_rows[file].path);
            zipped_no.text(file + 1);
            remain_no.text(selected_rows.length - (file + 1));
        }
        endzip_ui();
        resetInformationbar_values();
        selected_rows.length = 0;
        await console.log('All Files ar Split-Zipped: Current Values in Selected Rows  : ' + selected_rows.toString())
    }

}



module.exports = hide_zip_complete_container;