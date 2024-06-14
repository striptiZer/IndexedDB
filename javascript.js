const custumersData = [
  { name: 'serg', nik: '6', age: 41 },
  { name: 'alona', nik: '12', age: 25 },
  { name: 'zlata', nik: '69', age: 13 }
];

const dbName = "DataBase";
let db;

const request = indexedDB.open(dbName, 2);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const objectStore = db.createObjectStore("listPip", { autoIncrement: true });
  objectStore.createIndex("name", "name", { unique: false });

  objectStore.transaction.oncomplete = (event) => {
      const weobjectStore = db.transaction("listPip", "readwrite").objectStore("listPip");
      custumersData.forEach((separate) => {
          weobjectStore.add(separate);
      });
  };
};

request.onsuccess = (event) => {
  db = event.target.result;
  document.getElementById("addbase").addEventListener("click", addData);
  document.getElementById("delete").addEventListener("click", deleteData);
};

request.onerror = (event) => {
  console.error("Database error:", event.target.errorCode);
};

function tableData() {
  const table = document.getElementById("pip");
  const rows = table.getElementsByTagName("tr");
  const newPip = [];

  for (let row of rows) {
      const cells = row.getElementsByTagName("td");
      const obj = {
          name: cells[0].textContent,
          age: parseInt(cells[1].textContent, 10),
          nik: cells[2].textContent
      };
      newPip.push(obj);
  }
  return newPip;
}

function addData() {
  const data = tableData();
  const transaction = db.transaction(["listPip"], "readwrite");
  const objectStore = transaction.objectStore("listPip");

  data.forEach((item) => {
      objectStore.add(item);
  });

  transaction.oncomplete = () => {
      console.log("All items added to the database.");
  };

  transaction.onerror = (event) => {
      console.error("Transaction error:", event.target.errorCode);
  };
}

function deleteData() {
  const nameToDelete = document.getElementById("data").value;
  const transaction = db.transaction(["listPip"], "readwrite");
  const objectStore = transaction.objectStore("listPip");
  const index = objectStore.index("name");

  index.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
          if (cursor.value.name === nameToDelete) {
              const deleteRequest = cursor.delete();
              deleteRequest.onsuccess = () => {
                  console.log(`${nameToDelete} deleted from the database.`);
              };
          }
          cursor.continue();
      } else {
          console.log("Name not found in the database.");
      }
  };

  transaction.onerror = (event) => {
      console.error("Transaction error:", event.target.errorCode);
  };
}
