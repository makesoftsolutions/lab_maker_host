function load_monitors(grade) {
  fetch( getUrl() + "/monitors", {
    headers:{
      'ngrok-skip-browser-warning': 'true'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      const monitorListDiv = document.getElementById("monitorList");

      monitorListDiv.innerHTML = "";

      data.forEach((monitor) => {

        var studentGradeDescription =""
        monitor.gradeReference.forEach(gradeReference =>{
          const studentGradeId = gradeReference;
          const foundGrade = grade.find(
            (gradeItem) => gradeItem._id === studentGradeId
          );
          if (foundGrade) {
            studentGradeDescription += foundGrade.description;
            studentGradeDescription += "<br>";
          } else {
            console.warn(`Grade com _id ${studentGradeId} não encontrado.`);
          }

          studentGradeDescription += "<br>"
        })
        const monitorItem = document.createElement("div");
        monitorItem.classList.add("monitorInstance");
        monitorItem.innerHTML = `<div class="removeButton" style="display: none;"onclick="removeMonitor('${monitor._id}')">X</div><strong>${
          monitor.name
        }</strong><br>${studentGradeDescription}`;
        monitorListDiv.appendChild(monitorItem);
      });
    })
    .catch((error) => {
      console.error("Erro ao obter os monitores disponíveis:", error);
    });
}

function sortGrade(str1, str2) {
  const extrairDados = (str) => {
    const match = str.match(/^(seg|ter|qua|qui|sex)\s-\s(\d{2}:\d{2})\s-\s\d{2}:\d{2}$/);
    if (match) {
      return {
        dia: match[1],
        horarioInicio: match[2]
      };
    }
    return null;
  };

  const dados1 = extrairDados(str1);
  const dados2 = extrairDados(str2);

  if (!dados1 || !dados2) {
    return 0;
  }
  if (dados1.dia !== dados2.dia) {
    const dias = ['seg', 'ter', 'qua', 'qui', 'sex'];
    return dias.indexOf(dados1.dia) - dias.indexOf(dados2.dia);
  } else {
    return dados1.horarioInicio.localeCompare(dados2.horarioInicio);
  }
}

function load_students(grade) {
  fetch(getUrl() + "/students", {
    headers:{
      'ngrok-skip-browser-warning': 'true'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      const days = [
        "monday-list",
        "tuesday-list",
        "wednesday-list",
        "thursday-list",
        "friday-list",
      ];

      // Adicionei aqui aqui para ordenar os estudantes por dia e horário (funcionando)
      data.sort((a, b) => {
        const dateA = new Date(a.date[0]).getTime();
        const dateB = new Date(b.date[0]).getTime();

        if (dateA === dateB) {
          const gradeIdA = a.gradeReference[0];                   // Se os dias são iguais, ordenar por horário
          const gradeIdB = b.gradeReference[0];
          const timeA = grade.find((gradeItem) => gradeItem._id === gradeIdA).description;
          const timeB = grade.find((gradeItem) => gradeItem._id === gradeIdB).description;

          return timeA.localeCompare(timeB);
        }

        return dateA - dateB;
      });

      data.forEach((student) => {
        const studentReference = new Date(student.date[0]);
        const studentGradeId = student.gradeReference[0];
        const studentGradeDescription = grade.find(
          (gradeItem) => gradeItem._id === studentGradeId
        ).description;

        const week = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; //somando uma semana em ms

        days.forEach((day) => {
          if (
            studentReference.getDay() == days.indexOf(day) &&
            studentReference.getTime() < week &&
            studentReference.getTime() >= new Date().getTime() - 24*60*60*1000
          ) {
            const studentItem = document.createElement("div");
            studentItem.innerHTML = `<div class=\"student-print\"><div class="removeButton" style="display: none;"onclick="removeStudent('${student._id}')">X</div><strong>Nome:</strong> ${student.name}<br> <strong>Horário:</strong> ${studentGradeDescription}</div>`;
            document.getElementById(day).appendChild(studentItem);
          }
        });
      });
    })
    .catch((error) => {
      console.error("Erro ao obter os estudantes disponíveis:", error);
    });
}

function updateSelect() {
  let select = document.getElementById("gradeReference");

  select.disabled = false;
  select.value = "-1";

  const inputDate = new Date(document.getElementById("date").value);

  const filterDictionary = {
    0: "seg",
    1: "ter",
    2: "qua",
    3: "qui",
    4: "sex",
  };

  let filter = filterDictionary[inputDate.getDay()];

  Array.from(select.options).forEach((option) => {
    const display = option.text.includes(filter);
    option.style.display = display ? "block" : "none";
  });
}

function load_grade(){

fetch(getUrl() + "/grades", {
  headers:{
    'ngrok-skip-browser-warning': 'true'
  }
})
  .then((response) => response.json())
  .then((data) => {
    const gradesListDiv = document.getElementById('gradeList');
    const gradeDropdown = document.getElementById("gradeReference");
    const newMonitorGrade = document.getElementById("newMonitorGrade");

    gradesListDiv.innerHTML = "";

    data = data.sort((a,b) => a._id - b._id)

    document.getElementById("nextGrade").value = String(Number(data[data.length - 1]._id) + 1);

    data = data.sort((a,b) => sortGrade(a.description,b.description))

    data.forEach((grade) => {
      const gradeItem = document.createElement("div");
      gradeItem.innerHTML = `<div class="removeButton" style="display: none;"onclick="removeGrade(${grade._id})">X</div>${grade.description} (${grade._id})`;
      gradeItem.classList.add("gradeInstance")
      gradesListDiv.appendChild(gradeItem);

      const option = document.createElement("option");
      option.value = grade._id;
      option.text = `${grade.description} (${grade._id})`;
      gradeDropdown.appendChild(option);

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("checkbox");
      checkbox.value = grade._id;

      const label = document.createElement("div");
      label.innerText = grade.description;

      const monitorGrade = document.createElement("div");
      monitorGrade.appendChild(label);
      monitorGrade.appendChild(checkbox);
      monitorGrade.classList.add("monitorFormOption");

      newMonitorGrade.appendChild(monitorGrade);
    });
    load_students(data);
    load_monitors(data)
  })
  .catch((error) => {
    console.error("Erro ao obter as grade disponíveis:", error);
  });
}