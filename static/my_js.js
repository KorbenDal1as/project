let _id=null; // для id выбранных объектов
let dt=null; // для получаемого массива улиц


////////////////////// Функции получения ответа от сервера и вывода данных на экран///////////////////////////
function res_district(_data){
var ist = document.getElementById('row_district');
    for (item in _data) {
        let p = document.createElement("tr");
        p.id = 'district_id' + _data[item].id_district;
        p.innerHTML=_data[item].district;
        p.className = "align-middle";
        p.setAttribute("onclick", "load_city(event)");
        ist.prepend(p);
        }
}

function res_city(_data){
var ist = document.getElementById('row_city');
    for (item in _data) {
        let p = document.createElement("tr");
        p.id = 'city_id' + _data[item].id_city;
        p.innerHTML=_data[item].city;
        p.className = "align-middle";
        p.setAttribute("onclick", "load_street(event)");
        ist.prepend(p);
        }
}

function res_street(_data){
dt=_data;
var ist = document.getElementById('street_list');
    for (item in _data) {
        let p = document.createElement("option");
        p.id = 'street_id' + _data[item][1];
        p.innerHTML=_data[item][0];
        ist.prepend(p);
        }
}

function res_haus(_data){
num_haus.innerHTML="Номера домов на: " + street_input.value;
var ist = document.getElementById('haus_list');
    for (item in _data) {
        ist.innerHTML=ist.innerHTML+_data[item][0]+" ";
    }
}

///////////////////////////////// Запрос на сервер///////////////////////////////////////////////////
function submit_entry(processing,serv_handler) {
  var entry = {
    id: _id
  };

  fetch(window.origin + serv_handler, {
    method: "POST",
    credentials: 'include',
    body: JSON.stringify(entry),
    cache: "no-cache",
    headers: new Headers({
        "content-type": "application/json"
    })
  })

  .then(function (response) {
    if(response.status !=200) {
        console.log('Response status was not 200: ${response.status}');
        return;
    }
    response.json().then(function (data) {
        processing(data);
    })
  })
}


///////////////////////////////// Cброс интерфейса вывода данных///////////////////////////////////////////////////
//// ресет улиц///
    function Reset_street(){
      var res_st = document.getElementById('street_list');
      while (res_st.hasChildNodes()) {
        res_st.removeChild(res_st.lastChild);}
      document.getElementById('street_input').value = "";
    }
//// ресет городов///
    function Reset_city(){
      var res_ct = document.getElementById('row_city');
      while (res_ct.hasChildNodes()) {
          res_ct.removeChild(res_ct.lastChild);}
      H_street.innerHTML = ''; // убираем заголовок города
    }

//// ресет районов///
    function Reset_dictrict(){
      var res_dis = document.getElementById('row_district');
      while (res_dis.hasChildNodes()) {
          res_dis.removeChild(res_dis.lastChild);}
      H_city.innerHTML = ''; // убираем заголовок района
    }
//// ресет домов///
    function Reset_haus(){
      street_input.style="display: none";
      document.getElementById('num_haus').innerHTML="";
      document.getElementById('haus_list').innerHTML="";
    }


///////////////////////////////// Обработчик события: вывод районов///////////////////////////////////////////////////
function load_district() {
    let ser_hand_dis='/index/res_district'; // передаем в функцию запроса на сервер название пути к функции ответчику
    H_district.innerHTML = event.currentTarget.innerHTML; // устанавливаем заголовком выбранный регион
    _id = event.target.id; // сохраняем id для поиска по БД
    Reset_dictrict();
    Reset_city();
    Reset_street();
    Reset_haus();
    submit_entry(res_district,ser_hand_dis); // вызываем функцию передачи/получения данных с сервера
}

///////////////////////////////// Обработчик события: вывод городов///////////////////////////////////////////////////
function load_city() {
    let ser_hand_cit='/index/res_city';
    H_city.innerHTML = event.currentTarget.innerHTML;
    _id = event.target.id;
    //_region = event.currentTarget.innerHTML;
    Reset_city();
    Reset_street();
    Reset_haus();
    submit_entry(res_city,ser_hand_cit);
}

///////////////////////////////// Обработчик события: вывод улиц///////////////////////////////////////////////////
function load_street() {
    let ser_hand_str='/index/res_street';
    H_street.innerHTML = event.currentTarget.innerHTML;
    _id = event.target.id;
    //_region = event.currentTarget.innerHTML;
    Reset_street();
    Reset_haus();
    submit_entry(res_street,ser_hand_str);
    street_input.style="display: block"; // показываем на экране поле input
}

///////////////////////////////// Обработчик события: вывод домов///////////////////////////////////////////////////
function load_haus(id) {
     let ser_hand_hau='/index/res_haus';
      for (item in dt) if ((dt[item][0])==id.value) _id=(dt[item][1]); // ищем по массиву с улицами ID выбранной улицы
      submit_entry(res_haus,ser_hand_hau);
}