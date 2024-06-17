$(document).ready(function() {
    let db;

    $("#adddatabase").click(function() {
        const dbName = $("#databaseName").val();

        if (dbName) {
            const request = indexedDB.open(dbName, 2);

            request.onupgradeneeded = function(event) {
                db = event.target.result;
                if (!db.objectStoreNames.contains("listPip")) {
                    const objectStore = db.createObjectStore("listPip", { keyPath: "ssn", autoIncrement: true });
                    objectStore.createIndex("name", "name", { unique: false });
                }
            };

            request.onsuccess = function(event) {
                db = event.target.result;
                console.log("Database opened successfully:", db.name);
            };

            request.onerror = function(event) {
                console.error("Database error:", event.target.errorCode);
            };
        } else {
            alert("Please enter a valid database name.");
        }
    });

    $("#addbase").click(function() {
        const dbName = $("#databaseName").val();
        const name = $("#inputName").val();

        if (dbName && name) {
            const transaction = db.transaction(["listPip"], "readwrite");
            const objectStore = transaction.objectStore("listPip");
            const data = { name: name };

            const addRequest = objectStore.add(data);
            addRequest.onsuccess = function() {
                console.log("Name added to the database:", name);
                $("#inputName").val("");
            };

            addRequest.onerror = function(event) {
                console.error("Add data error:", event.target.errorCode);
            };
        } else {
            alert("Please enter a database name and a name to add.");
        }
    });

    $("#delete").click(function() {
        const dbName = $("#databaseName").val();
        const nameToDelete = $("#data").val();

        if (dbName && nameToDelete) {
            const transaction = db.transaction(["listPip"], "readwrite");
            const objectStore = transaction.objectStore("listPip");
            const index = objectStore.index("name");

            index.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.name === nameToDelete) {
                        cursor.delete().onsuccess = function() {
                            console.log(`${nameToDelete} deleted from the database.`);
                            $("#data").val("");
                        };
                    } else {
                        cursor.continue();
                    }
                } else {
                    console.log("Name not found in the database.");
                }
            };

            transaction.onerror = function(event) {
                console.error("Transaction error:", event.target.errorCode);
            };
        } else {
            alert("Please enter a database name and a name to delete.");
        }
    });

    $("#deleteDatabase").click(function() {
        const dbName = $("#databased").val();

        if (dbName) {
            const request = indexedDB.deleteDatabase(dbName);

            request.onsuccess = function() {
                console.log(`Database ${dbName} deleted successfully.`);
                $("#databased").val("");
            };

            request.onerror = function(event) {
                console.error("Delete database error:", event.target.errorCode);
            };
        } else {
            alert("Please enter a database name to delete.");
        }
    });

    $("#showdata").click(function() {
        const dbName = $("#databaseName").val();

        if (dbName) {
            const transaction = db.transaction(["listPip"], "readonly");
            const objectStore = transaction.objectStore("listPip");

            let resultString = "";
            objectStore.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    resultString += `Name: ${cursor.value.name}, SSN: ${cursor.value.ssn}\n`;
                    cursor.continue();
                } else {
                    $("#database").val(resultString.trim());
                }
            };

            transaction.onerror = function(event) {
                console.error("Transaction error:", event.target.errorCode);
            };
        } else {
            alert("Please enter a database name to show data.");
        }
    });

    $("#showdatabase").click(function() {
        const databases = indexedDB.databases();
        databases.then(function(dbList) {
            let dbNames = dbList.map(db => db.name).join('\n');
            $("#database").val(dbNames);
        }).catch(function(error) {
            console.error("Error getting database names:", error);
            $("#database").val("Error retrieving database names.");
        });
    });
});
