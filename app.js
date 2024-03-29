async function submitForm(data,path) {
  const apiUrl = getUrl()+ '/' + path;
  await axios.post(apiUrl, data)
      .then(response => {
          alert('Cadastro concluído com sucesso!');
          clearForm();
          window.location.reload()
      })
      .catch(error => {
          alert('Erro ao cadastrar: ' + error.response.data.error);
      });
}

let salvaStudents = []
function addStudent() {
  const name = document.getElementById('name').value;
  const rawDate = document.getElementById('date').value;
  const gradeReference = Array.from(document.getElementById('gradeReference').selectedOptions, option => option.value);

  if (!rawDate || isNaN(new Date(rawDate))) {
    alert('Data inválida!');
    return;
  }

  const formattedDate = new Date(rawDate).toISOString();

  gradeReference.forEach(grade => {
    if (grade != -1){
      const studentData = {
          name,
          date: [formattedDate],
          gradeReference: [grade]
      }; 
      salvaStudents.push(studentData);
    }
  });
}


function addToGrade(){
  const description = document.getElementById("description").value;
  const regex = /^(seg|ter|qua|qui|sex)\s-\s(\d{2}:\d{2})\s-\s(\d{2}:\d{2})$/;

  if (document.getElementById("nextGrade").value == null){
    document.getElementById("nextGrade").value = 1;
  }

  if (regex.test(description)){
    const match = description.match(regex);
    const day = match[1];
    const startTime = match[2];
    const endTime = match[3];

    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);

    if (endHour > startHour + 1) {

      for (let i = startHour; i < endHour; i++) {

        const newStartTime = `${i < 10 ? '0' : ''}${i}:00`;
        const newEndTime = `${i + 1 < 10 ? '0' : ''}${i + 1}:00`;
        const newDescription = `${day} - ${newStartTime} - ${newEndTime}`;
        const grade = [{
          "_id": Number(document.getElementById("nextGrade").value) + i - startHour,
          "description": newDescription
        }];

        submitForm({"Grade": grade},'grades');
      }
      
    } else {
      const grade = [{
        "_id": Number(document.getElementById("nextGrade").value),
        "description": description
      }];
      submitForm({"Grade": grade},'grades');
    }
    localStorage.setItem('form', 'grade');
  } else {
    alert("A entrada está em um formato inválido. Siga o exemplo: seg - 07:00 - 08:00");
  }
}


async function addMonitor() {
  const name = document.getElementById('nameMonitor').value;
  const gradeReference = document.getElementsByClassName('checkbox')
  let selectedReferences = []

  Array.from(gradeReference).forEach(checkbox => {
    if(checkbox.checked){
      selectedReferences.push(checkbox.value)
    }
  })

  const monitorData = {
    name,
    gradeReference: selectedReferences
  }

  submitForm(monitorData,'monitors')
  localStorage.setItem('form', 'monitor');
}

function showPopup() {
  const popupContent = document.getElementById('popup-content');
  popupContent.innerHTML = `
  <p>  
  Para manter o controle da limpeza, organização e orientação dos alunos, é necessário limitar o número de pessoas
  dentro do laboratório.
  <strong>REGRAS:</strong>
  <ol>
    <li>Não é permitido marcar horário para estudo, laboratório não é lugar para estudar, é local de fazer projetos.</li>
    <li>Poderá ser marcado no mesmo horário um máximo de 8 pessoas, de acordo com o número de cadeiras.</li>
    <li>Os horários disponíveis são de acordo com a disponibilidade dos monitores.</li>
    <li>Cada marcação terá duração de uma hora, portanto, se atente em marcar mais horários caso queira ficar um tempo maior.</li>
    <li>É necessário que cada pessoa marque individualmente, para que não extrapole o limite de pessoas no laboratório.</li>
    <li>O aluno que abusar do horários de marcação, por exemplo marcar inúmeros horários desnecessariamente ou marcar
      horário para ficar ocioso no laboratório, estará sujeito a punição de restrição temporária.</li>
    <li>É imprescindível seguir as orientações do monitores, casos de desrespeito serão punidos perante as regras do
      campus.</li>
    <li>Todos os materiais utilizados deverão ser guardados no local que estavam, caso esteja fora, peça auxílio a algum
      monitor.</li>
  </ol>
</p>
  <div>
    <input class="popUpInput" id="terms" type="checkbox"><p id="termsText">Li e aceito os termos</p></input>
  </div>
    <button class="popUpInput" onclick="cadastrarStudent()">Cadastrar</button>
  <button class="popUpInput" type="button" onclick="closePopup()">Fechar</button>
  `;

  const popup = document.getElementById('popup');
  popup.style.display = 'block';
}

async function cadastrarStudent() {

  salvaStudents.forEach(grade => {
    submitForm(grade,'students');
  })
  closePopup(); 
  localStorage.setItem('form', 'student');
}

function removeStudentVetor(index) {
  salvaStudents.splice(index, 1);
  alert('Estudante removido com sucesso!');
  clearForm();
}

function closePopup() {
  const popup = document.getElementById('popup');
  popup.style.display = 'none';
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('date').value = '';
    document.getElementById('gradeReference').value = '';
}

function getCurrentDate() {
  const today = new Date();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;

  const currentDate = today.getFullYear() + '-' + month + '-' + day;
  return currentDate;
}

function getNextDayOfWeek(dayOfWeek,id) {
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const daysUntilNextDay = (dayOfWeek + 7 - currentDayOfWeek) % 7;

  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + daysUntilNextDay);

  document.getElementById(id).innerText = "-  " + nextDay.getDate() + " / " + (nextDay.getMonth() + 1)
}

function switchToMonitors(){
  document.getElementById("pageHeader").innerText = "Cadastro de Monitores"
  document.getElementById("studentForm").style.display = "none"
  document.getElementById("monitorForm").style.display = "block"
  document.getElementById("students-display").style.display = "none"
  document.getElementById("monitors-display").style.display = "block"
  document.getElementById("gradeForm").style.display = "none"
  document.getElementById("gradeDisplay").style.display = "none"

  document.getElementById("switchBack").onclick = switchToStudents
  document.getElementById("switchFoward").onclick = switchToGrade

  localStorage.setItem('form', 'monitor');
}

function switchToStudents(){
  document.getElementById("pageHeader").innerText = "Cadastro de Estudantes"
  document.getElementById("studentForm").style.display = "block"
  document.getElementById("monitorForm").style.display = "none"
  document.getElementById("students-display").style.display = "block"
  document.getElementById("monitors-display").style.display = "none"
  document.getElementById("gradeForm").style.display = "none"
  document.getElementById("gradeDisplay").style.display = "none"

  document.getElementById("switchBack").onclick = switchToGrade
  document.getElementById("switchFoward").onclick = switchToMonitors

  localStorage.setItem('form', 'student');
}

function switchToGrade(){
  document.getElementById("pageHeader").innerText = "Cadastro de Grade"
  document.getElementById("studentForm").style.display = "none"
  document.getElementById("monitorForm").style.display = "none"
  document.getElementById("students-display").style.display = "none"
  document.getElementById("monitors-display").style.display = "none"
  document.getElementById("gradeForm").style.display = "block"
  document.getElementById("gradeDisplay").style.display = "block"

  document.getElementById("switchBack").onclick = switchToMonitors
  document.getElementById("switchFoward").onclick = switchToStudents

  localStorage.setItem('form', 'grade');
}

window.onload = ()=>{
  load_grade()
  const form = localStorage.getItem('form');

  if (localStorage.getItem('form') === 'student' || localStorage.getItem('form') == null){
    switchToStudents()
  }
  if (localStorage.getItem('form') === 'monitor'){
    switchToMonitors()
  }
  if (localStorage.getItem('form') === 'grade'){
    switchToGrade()
  }

  var daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  const currentDayIndex = new Date().getDay() -1
  const adjustedIndex = currentDayIndex < 0 ? 4 : currentDayIndex
  daysOfWeek = [
    ...daysOfWeek.slice(adjustedIndex),
    ...daysOfWeek.slice(0, adjustedIndex)
  ];

  const dict = {
    'Segunda': 'monday',
    'Terça': 'tuesday',
    'Quarta': 'wednesday',
    'Quinta': 'thursday',
    'Sexta': 'friday'
  }
  

  daysOfWeek.forEach(day => {

    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('day-header');

    const dayParagraph = document.createElement('p');
    dayParagraph.textContent = day;
    headerDiv.appendChild(dayParagraph);

    const headerDateDiv = document.createElement('div');
    headerDateDiv.id = `${dict[day]}`;

    const StudentsListDiv = document.createElement('div');
    StudentsListDiv.id = `${dict[day]}-list`;
    StudentsListDiv.classList.add('students-list')
    
    dayDiv.appendChild(headerDiv);
    headerDiv.appendChild(headerDateDiv);
    dayDiv.appendChild(StudentsListDiv)

    document.getElementById("week").appendChild(dayDiv);
  });

  getNextDayOfWeek(1,"monday");
  getNextDayOfWeek(2, 'tuesday');
  getNextDayOfWeek(3, 'wednesday');
  getNextDayOfWeek(4, 'thursday');
  getNextDayOfWeek(5, 'friday');

  const currentDate = new Date();
  const minDate = currentDate.toISOString().split('T')[0];

  const maxDate = new Date(currentDate);
  maxDate.setDate(maxDate.getDate() + 14);
  const maxDateString = maxDate.toISOString().split('T')[0];

  document.getElementById('date').setAttribute('min', minDate);
  document.getElementById('date').setAttribute('max', maxDateString);
}

window.addEventListener('keydown', function(event) {
  if (event.key === 'Shift') {
    Array.from(this.document.getElementsByClassName("removeButton")).forEach(box => {
    box.style.display = "block"
    })
  }
});

window.addEventListener('keyup', function(event) {
  if (event.key === 'Shift') {
      Array.from(this.document.getElementsByClassName("removeButton")).forEach(box => {
        box.style.display = "none"
      })
  }
});

function removeStudent(id){

  const apiUrl = getUrl() + '/studentsRemove';
  const data = {"_id":id}

  axios.post(apiUrl, data)
      .then(response => {
          alert('Aluno removido com sucesso!');
          localStorage.setItem('form', 'student');
          window.location.reload()
      })
      .catch(error => {
          alert('Erro ao remover: ' + error.response.data.error);
      });
}

function removeMonitor(id){

  const apiUrl = getUrl() + '/monitorsRemove';
  const data = {"_id":id}

  axios.post(apiUrl, data)
      .then(response => {
          alert(response.data.message);
          localStorage.setItem('form', 'monitor');
          window.location.reload()
      })
      .catch(error => {
          alert('Erro ao remover: ' + error.response.data.error);
      });
}

function toggleMonitorStatus(id, status){

  let apiUrl = ""
  if (status === "active"){
    apiUrl = getUrl() + '/suspendMonitors';
  }
  else{
    apiUrl = getUrl() + '/activateMonitors';
  }

  const data = {"_id": id}

  axios.post(apiUrl, data)
      .then(response => {
          alert(response.data.message);
          localStorage.setItem('form', 'monitor');
          window.location.reload()
      })
      .catch(error => {
          alert('Erro ao remover: ' + error.response.data.error);
      });
}

function removeGrade(id){

  const apiUrl = getUrl() + '/gradesRemove';
  const data = {"_id":id}

  axios.post(apiUrl, data)
      .then(response => {
          alert(response.data.message);
          localStorage.setItem('form', 'grade');
          window.location.reload()
      })
      .catch(error => {
          alert('Erro ao remover: ' + error.response.data.error);
      });
}