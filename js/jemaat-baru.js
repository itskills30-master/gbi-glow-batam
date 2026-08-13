/*====================================================
GBI ALTAR TABERNAKEL BATAM
JEMAAT BARU
====================================================*/


/*====================================================
API: AMBIL DARI Code.gs
====================================================*/
const API_URL =
"https://script.google.com/macros/s/AKfycbxRmv1uHf_AB9vPSwCVDkI2AArrbRJQY49nQS5ERw28CAtZg7DJmo0CqflPLpgZhEkt/exec";


/*====================================================
GLOBAL VARIABLE
====================================================*/

let semuaData = [];
let dataTampil = [];


/*====================================================
ELEMENT
====================================================*/
const loadingBox = document.getElementById("loadingBox");
const errorBox = document.getElementById("errorBox");
const emptyBox = document.getElementById("emptyBox");
const listJemaat = document.getElementById("listJemaat");
const totalData = document.getElementById("totalData");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");

/*====================================================
HALAMAN DIBUKA
====================================================*/

document.addEventListener("DOMContentLoaded",()=>{

    document.getElementById("appVersion").textContent =
        "Version " + APP_VERSION;

    if(!checkSession()){
        return;
    }

    aturMenuPanel();

    loadData();

});


/*====================================================
AMBIL DATA DARI OPENSHEET
====================================================*/

async function loadData(forceRefresh=false){

    showLoading();

    hideError();

    hideEmpty();

    listJemaat.innerHTML = "";

    try{

        /*==============================
        CEK CACHE
        ==============================*/

        if(!forceRefresh){

            const cache = sessionStorage.getItem(

                "JEMAAT_BARU"

            );

            if(cache){

                const data = JSON.parse(cache);

                console.log("JEMAAT : CACHE");

                data.sort((a,b)=>{

                    return parseTimestamp(b["Timestamp"]) -
                           parseTimestamp(a["Timestamp"]);

                });

                semuaData = data;
                dataTampil = [...data];

                totalData.innerHTML = semuaData.length;

                hideLoading();

                if(semuaData.length===0){

                    showEmpty();
                    return;

                }

                renderData(semuaData);

                return;

            }

        }

        /*==============================
        AMBIL DARI GAS
        ==============================*/

        const token =
            localStorage.getItem("GBI_LOGIN_TOKEN");


            const body = new URLSearchParams();

            body.append(
                "action",
                "GET_JEMAAT_BARU"
            );

            body.append(
                "token",
                token
            );

        const response = await fetch(API_URL,{

            method:"POST",

            body:body

        });

        if(!response.ok){

            throw new Error("Gagal mengambil data");

        }

        const data = await response.json();

        console.log("ISI RESPONSE :", data);
        console.log("TIPE :", typeof data);
        console.log("IS ARRAY :", Array.isArray(data));
        console.log("RESPONSE GAS =", data);

        sessionStorage.setItem(
            "JEMAAT_BARU",
            JSON.stringify(data)
        );

        console.log("JEMAAT : GAS");

        data.sort((a,b)=>{

            return parseTimestamp(b["Timestamp"]) -
                   parseTimestamp(a["Timestamp"]);

        });

        semuaData = data;
        dataTampil = [...data];

        totalData.innerHTML = semuaData.length;

        hideLoading();

        if(semuaData.length===0){

            showEmpty();
            return;

        }

        renderData(semuaData);

    }

    catch(error){

        console.error(error);

        hideLoading();

        showError();

    }

}

/*====================================================
REFRESH JEMAAT BARU
====================================================*/

function refreshJemaatBaru(){
    console.log("REFRESH JEMAAT BARU DIKLIK");
    sessionStorage.removeItem(
        "JEMAAT_BARU"
    );
    loadData(true);
}


/*====================================================
LOADING
====================================================*/

function showLoading(){

    loadingBox.classList.remove("d-none");

}

function hideLoading(){

    loadingBox.classList.add("d-none");

}


/*====================================================
ERROR
====================================================*/

function showError(){

    errorBox.classList.remove("d-none");

}

function hideError(){

    errorBox.classList.add("d-none");

}


/*====================================================
EMPTY
====================================================*/

function showEmpty(){

    emptyBox.classList.remove("d-none");

}

function hideEmpty(){

    emptyBox.classList.add("d-none");

}


/*====================================================
RENDER DATA
====================================================*/
function renderData(data){

    dataTampil = [...data];

    listJemaat.innerHTML = "";

    data.forEach((item,index)=>{

        listJemaat.innerHTML += createCard(item,index);

    });

    aktifkanCard();

}


/*====================================================
CONVERT GOOGLE DRIVE URL
====================================================*/

function getDriveImage(url){

    if(!url) return "";

    // format:
    // https://drive.google.com/open?id=xxxxx
    if(url.includes("open?id=")){

        const id = url.split("open?id=")[1];

        return `https://drive.google.com/thumbnail?id=${id}&sz=w300`;

    }

    // format:
    // https://drive.google.com/file/d/xxxxx/view
    if(url.includes("/file/d/")){

        const id = url.split("/file/d/")[1].split("/")[0];

        return `https://drive.google.com/thumbnail?id=${id}&sz=w300`;

    }

    return url;

}

/*====================================================
FORMAT NOMOR WHATSAPP
====================================================*/

function formatWhatsapp(nomor){

    if(!nomor) return "";

    nomor = nomor.replace(/\D/g,"");

    if(nomor.startsWith("0")){

        nomor = "62" + nomor.substring(1);

    }

    return nomor;

}

function formatTanggal(tanggal){

    if(!tanggal) return "-";

    const d = new Date(tanggal);

    return d.toLocaleDateString("id-ID",{

        day:"numeric",

        month:"long",

        year:"numeric"

    });

}


/*====================================================
PARSE TIMESTAMP GOOGLE FORM
====================================================*/
function parseTimestamp(timestamp){

    if(!timestamp) return 0;

    const bagian = timestamp.split(" ");

    const tanggal = bagian[0].split("/");
    const waktu = (bagian[1] || "00:00:00").split(":");

    const bulan = parseInt(tanggal[0],10) - 1;
    const hari = parseInt(tanggal[1],10);
    const tahun = parseInt(tanggal[2],10);

    const jam = parseInt(waktu[0],10);
    const menit = parseInt(waktu[1],10);
    const detik = parseInt(waktu[2],10);

    return new Date(
        tahun,
        bulan,
        hari,
        jam,
        menit,
        detik
    ).getTime();

}

/*====================================================
MEMBUAT CARD JEMAAT
====================================================*/

function createCard(item,index){

    const nama = item["Nama Lengkap"] || "-";

    // Kolom Google Form nanti
    const foto = getDriveImage(item["Pas Foto"]);

    let avatar = "";

    if(foto){

        avatar = `
            <img
                src="${foto}"
                class="avatar"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">

            <div class="avatar-default" style="display:none;">
                <i class="fa-solid fa-user"></i>
            </div>
        `;

    }else{

        avatar = `
            <div class="avatar-default">
                <i class="fa-solid fa-user"></i>
            </div>
        `;

    }

    return `

    <div class="jemaat-card" data-index="${index}">

        <div class="d-flex align-items-center">

            ${avatar}

            <div class="ms-3 flex-grow-1">

                <div class="nama">

                ${nama}

            </div>

            <div class="bergabung-sejak">

    Bergabung sejak: ${formatTanggal(item["Timestamp"])}

                </div>

            </div>

            <i class="fa-solid fa-chevron-right text-secondary"></i>

        </div>

    </div>

    `;

}

/*====================================================
AKTIFKAN CLICK CARD
====================================================*/

function aktifkanCard(){

    document.querySelectorAll(".jemaat-card").forEach(card=>{

        card.addEventListener("click",()=>{

            const index = card.dataset.index;

            showDetail(dataTampil[index]);

        });

    });

}


/*====================================================
BADGE BAPTIS
====================================================*/

function getBaptisBadge(status){

    if(!status){

        return `<span class="badge badge-secondary">-</span>`;

    }

    const value = status.toUpperCase();

    if(value==="YA"){

        return `<span class="badge badge-success">Sudah</span>`;

    }

    if(value==="TIDAK"){

        return `<span class="badge badge-danger">Belum</span>`;

    }

    return `<span class="badge badge-secondary">${status}</span>`;

}


/*====================================================
BADGE STATUS JEMAAT
====================================================*/

function getStatusBadge(status){

    if(!status){

        return `<span class="badge badge-secondary">-</span>`;

    }

    switch(status){

        case "Jemaat":

            return `<span class="badge badge-primary">${status}</span>`;

        case "Pelayan":

            return `<span class="badge badge-success">${status}</span>`;

        case "Simpatisan":

            return `<span class="badge badge-warning">${status}</span>`;

        default:

            return `<span class="badge badge-secondary">${status}</span>`;

    }

}


/*====================================================
SEARCH
====================================================*/

searchInput.addEventListener("keyup",()=>{

    const keyword = searchInput.value.trim().toLowerCase();

    const hasil = semuaData.filter(item=>{

        return [

            item["Nama Lengkap"],
            item["Alamat Lengkap"],
            item["Nomor Telepon"],
            item["Pekerjaan"],
            item["Tempat Lahir"],
            item["Status di GBI Altar Tabernakel Batam"],
            item["Apakah Sudah Baptis Selam"]

        ]
        .filter(Boolean)
        .some(value =>
            value.toString().toLowerCase().includes(keyword)
        );

    });

    renderData(hasil);

});

/*====================================================
DETAIL JEMAAT
====================================================*/

function showDetail(item){

    const detailContent =
        document.getElementById("detailContent");

    /*================================================
    FOTO
    =================================================*/

    const foto =
        getDriveImage(item["Pas Foto"] || "");

    console.log("Pas Foto :", item["Pas Foto"]);
    console.log("Foto URL :", foto);

    const fotoHtml = foto
        ? `
            <img
                src="${foto}"
                class="detail-avatar"
                style="cursor:pointer"
                onclick="previewFoto('${foto}')"
                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                ">

            <div
                class="detail-avatar-default"
                style="display:none;">

                <i class="fa-solid fa-user"></i>

            </div>
          `
        : `
            <div class="detail-avatar-default">

                <i class="fa-solid fa-user"></i>

            </div>
          `;


    /*================================================
    PASANGAN
    HANYA TAMPIL JIKA NAMA PASANGAN ADA
    =================================================*/

    let pasanganHtml = "";

    if(
        String(item["Nama Istri/Suami"] || "").trim()
    ){

        pasanganHtml = `

            <div class="card shadow-sm mb-3">

                <div class="card-body">

                    <h6 class="fw-bold text-primary mb-3">

                        <i class="fa-solid fa-heart me-2"></i>

                        Data Pasangan

                    </h6>

                    <div class="table-responsive">

                        <table class="table table-striped mb-0">

                            <tr>

                                <th width="40%">
                                    Nama
                                </th>

                                <td>
                                    ${item["Nama Istri/Suami"] || "-"}
                                </td>

                            </tr>

                            <tr>

                                <th>
                                    Status Pasangan
                                </th>

                                <td>
                                    ${item["Status Pasangan"] || "-"}
                                </td>

                            </tr>

                            <tr>

                                <th>
                                    Tempat Lahir
                                </th>

                                <td>
                                    ${item["Tempat Lahir Pasangan"] || "-"}
                                </td>

                            </tr>

                            <tr>

                                <th>
                                    Tanggal Lahir
                                </th>

                                <td>
                                    ${item["Tanggal Lahir Pasangan"] || "-"}
                                </td>

                            </tr>

                        </table>

                    </div>

                </div>

            </div>

        `;

    }


    /*================================================
    ANAK
    SETIAP ANAK HANYA TAMPIL JIKA NAMANYA ADA
    =================================================*/

    const daftarAnak = [

        {
            nomor: 1,
            nama: item["Nama anak pertama"],
            jenisKelamin: item["Jenis Kelamin anak pertama"],
            tempatLahir: item["Tempat Lahir anak pertama"],
            tanggalLahir: item["Tanggal lahir anak pertama"]
        },

        {
            nomor: 2,
            nama: item["Nama anak kedua"],
            jenisKelamin: item["Jenis Kelamin anak kedua"],
            tempatLahir: item["Tempat Lahir anak kedua"],
            tanggalLahir: item["Tanggal lahir anak kedua"]
        },

        {
            nomor: 3,
            nama: item["Nama anak ketiga"],
            jenisKelamin: item["Jenis Kelamin anak ketiga"],
            tempatLahir: item["Tempat Lahir anak ketiga"],
            tanggalLahir: item["Tanggal lahir anak ketiga"]
        }

    ];


    let anakHtml = "";


    daftarAnak.forEach(anak => {

        /*============================================
        JIKA NAMA ANAK KOSONG
        MAKA SELURUH BLOK DISEMBUNYIKAN
        ============================================*/

        if(
            !String(anak.nama || "").trim()
        ){

            return;

        }


        anakHtml += `

            <div class="card shadow-sm mb-3">

                <div class="card-body">

                    <h6 class="fw-bold text-primary mb-3">

                        <i class="fa-solid fa-child me-2"></i>

                        Anak ${anak.nomor}

                    </h6>

                    <div class="table-responsive">

                        <table class="table table-striped mb-0">

                            <tr>

                                <th width="40%">
                                    Nama
                                </th>

                                <td>
                                    ${anak.nama || "-"}
                                </td>

                            </tr>

                            <tr>

                                <th>
                                    Jenis Kelamin
                                </th>

                                <td>
                                    ${anak.jenisKelamin || "-"}
                                </td>

                            </tr>

                            <tr>

                                <th>
                                    Tempat Lahir
                                </th>

                                <td>
                                    ${anak.tempatLahir || "-"}
                                </td>

                            </tr>

                            <tr>

                                <th>
                                    Tanggal Lahir
                                </th>

                                <td>
                                    ${anak.tanggalLahir || "-"}
                                </td>

                            </tr>

                        </table>

                    </div>

                </div>

            </div>

        `;

    });


    /*================================================
    DETAIL UTAMA
    =================================================*/

    detailContent.innerHTML = `

        <div class="text-center mb-4">

            ${fotoHtml}

            <h4 class="mt-3 fw-bold">

                ${item["Nama Lengkap"] || "-"}

            </h4>

        </div>


        <!-- =========================================
        DATA JEMAAT
        ========================================== -->

        <div class="card shadow-sm mb-3">

            <div class="card-body">

                <h6 class="fw-bold text-primary mb-3">

                    <i class="fa-solid fa-user me-2"></i>

                    Data Jemaat

                </h6>

                <div class="table-responsive">

                    <table class="table table-striped mb-0">

                        <tr>

                            <th width="40%">
                                Nama Lengkap
                            </th>

                            <td>
                                ${item["Nama Lengkap"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Bergabung Sejak
                            </th>

                            <td>
                                ${formatTanggal(
                                    item["Timestamp"]
                                ) || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Jenis Kelamin
                            </th>

                            <td>
                                ${item["Jenis Kelamin"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Tempat Lahir
                            </th>

                            <td>
                                ${item["Tempat Lahir"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Tanggal Lahir
                            </th>

                            <td>
                                ${item["Tanggal Lahir"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Nomor Telepon
                            </th>

                            <td>
                                ${item["Nomor Telepon"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Email
                            </th>

                            <td>
                                ${item["Email Address"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Alamat
                            </th>

                            <td>
                                ${item["Alamat Lengkap"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Pekerjaan
                            </th>

                            <td>
                                ${item["Pekerjaan"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Status Baptis
                            </th>

                            <td>
                                ${item["Apakah Sudah Baptis Selam"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Status Pernikahan
                            </th>

                            <td>
                                ${item["Status Pernikahan"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Status di GBI
                            </th>

                            <td>
                                ${item[
                                    "Status di GBI Altar Tabernakel Batam"
                                ] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Bergabung Dari Tahun
                            </th>

                            <td>
                                ${item["Bergabung dari Tahun"] || "-"}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                KOMSEL / SDK
                            </th>

                            <td>
                                ${item[
                                    "Apakah sudah terdaftar di salah satu Ibadah KOMSEL atau SDK (Surga Dalam Keluarga)?"
                                ] || "-"}
                            </td>

                        </tr>

                    </table>

                </div>

            </div>

        </div>


        <!-- =========================================
        DATA PASANGAN
        HIDDEN JIKA TIDAK ADA
        ========================================== -->

        ${pasanganHtml}


        <!-- =========================================
        DATA ANAK
        SETIAP BLOK HIDDEN JIKA TIDAK ADA NAMA
        ========================================== -->

        ${anakHtml}


        <!-- =========================================
        KONTAK
        ========================================== -->

        <div class="mt-4 d-grid gap-2">

            <a
                href="https://wa.me/${formatWhatsapp(
                    item["Nomor Telepon"] || ""
                )}"
                target="_blank"
                class="btn btn-success">

                <i class="fa-brands fa-whatsapp me-2"></i>

                Chat WhatsApp

            </a>

            <a
                href="https://wa.me/${formatWhatsapp(
                    item["Nomor Telepon"] || ""
                )}"
                target="_blank"
                class="btn btn-outline-success">

                <i class="fa-solid fa-phone me-2"></i>

                Telepon via WhatsApp

            </a>

        </div>

    `;


    /*================================================
    BUKA OFFCANVAS
    =================================================*/

    const canvas =
        new bootstrap.Offcanvas(
            document.getElementById("detailCanvas")
        );

    canvas.show();

}

/*====================================================
PREVIEW FOTO
====================================================*/
function previewFoto(url){

    document.getElementById("fotoPreview").src = url;

    const modal = new bootstrap.Modal(
        document.getElementById("fotoModal")
    );

    modal.show();

}


function logout(){

    // Tutup modal
    const modal =
        bootstrap.Modal.getInstance(
            document.getElementById("logoutModal")
        );

    if(modal){
        modal.hide();
    }

    // Hapus session login
    localStorage.removeItem("GBI_LOGIN_TOKEN");
    localStorage.removeItem("GBI_TOKEN_EXPIRED");

    // Kembali ke halaman login
    window.location.href = "index.html";

}

function showLogoutModal(){

    const modal = new bootstrap.Modal(
        document.getElementById("logoutModal")
    );

    modal.show();

}
