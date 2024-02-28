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
  const gradeReference = document.getElementById('gradeReference').value.split(',');

  if (!rawDate || isNaN(new Date(rawDate))) {
    alert('Data inválida!');
    return;
  }

  const formattedDate = new Date(rawDate).toISOString();
  const studentData = {
      name,
      date: [formattedDate],
      gradeReference: gradeReference.map(reference => Number(reference.trim()))
  }; 
  salvaStudents.push(studentData);
  
}

function addToGrade(){
  const description = document.getElementById("description").value
  const regex = /^(seg|ter|qua|qui|sex)\s-\s\d{2}:\d{2}\s-\s\d{2}:\d{2}$/;


  if (document.getElementById("nextGrade").value == null){
    document.getElementById("nextGrade").value = 1
  }

  if (regex.test(description)){
    const grade = [{
      "_id": Number(document.getElementById("nextGrade").value),
      "description": description
    }]
    submitForm({"Grade":grade},'grades')
    localStorage.setItem('form', 'grade');
  }
  else{
    alert("A entrada está em um formato inválido. Siga o exemplo: seg - 07:00 - 08:00")
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

function showPopup(studentData, index) {
  const popupContent = document.getElementById('popup-content');
  popupContent.innerHTML = `
      <strong>Nome:</strong> ${studentData.name} - 
      <strong>Data:</strong> ${studentData.date} - 
      <strong>Referências de Grade:</strong> ${studentData.gradeReference.join(', ')}
      <p class="warning-message">Após cadastrar, não será mais possível editar ou excluir.</p>
      <button onclick="removeStudentVetor(${index})">Remover </button>
      <button onclick="cadastrarStudent()">Cadastrar</button>
      <button type="button" onclick="closePopup()">Fechar</button>
  `;

  const popup = document.getElementById('popup');
  popup.style.display = 'block';
}

async function cadastrarStudent() {
  const latestStudentIndex = salvaStudents.length - 1;
  const latestStudentData = salvaStudents[latestStudentIndex];
  await submitForm(latestStudentData,'students');
  closePopup(); 
  localStorage.setItem('form', 'student');
  window.location.reload()
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

function removeGrade(id){

  const apiUrl = getUrl + '/gradesRemove';
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