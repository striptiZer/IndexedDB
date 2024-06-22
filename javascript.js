$(document).ready(function() {
    let db;

$("#adddatabase").click(function() {
    const dbName = $("#databaseNameAdd").val();

    if (dbName) {
        const version = 1;
        const request = indexedDB.open(dbName, version);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains("list")) {
                const objectStore = db.createObjectStore("list", { keyPath: "ssn", autoIncrement: true });
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

    $('#activatedatabase').click(function() {
        const dbName = $('#databaseNameAct').val().trim();

        if (dbName) {
            activateDatabase(dbName);
        } else {
            alert('Please enter a database name.');
        }
    });

    function activateDatabase(dbName) {
        if (!window.indexedDB) {
            return;
        }

        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains("list")) {
                const objectStore = db.createObjectStore("list", { keyPath: "ssn", autoIncrement: true });
                objectStore.createIndex("name", "name", { unique: false });
            }
            alert(`Database ${dbName} created with an object store "list".`);
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            console.log("Database activated successfully.");
        };

        request.onerror = function(event) {
            alert(`Error activating database: ${event.target.errorCode}`);
        };
    }

    $('#addbase').click(function() {
        const name = $('#inputName').val().trim();

        if (db && name) {
            const transaction = db.transaction(["list"], "readwrite");
            const objectStore = transaction.objectStore("list");

            const getRequest = objectStore.index("name").get(name);

            getRequest.onsuccess = function(event) {
                const result = event.target.result;
                if (!result) {
                    const addRequest = objectStore.add({ name: name });
                    addRequest.onsuccess = function() {
                        console.log("Name added to the database:", name);
                        $('#inputName').val("");
                    };
                    addRequest.onerror = function(event) {
                        console.error("Add data error:", event.target.errorCode);
                    };
                } else {
                    console.log("Name already exists in the database:", name);
                }
            };

            getRequest.onerror = function(event) {
                console.error("Get data error:", event.target.errorCode);
            };
        } else {
            alert("Please activate the database and enter a name to add.");
        }
    });

    $('#showdata').click(function() {
        if (db) {
            const transaction = db.transaction(["list"], "readonly");
            const objectStore = transaction.objectStore("list");

            let resultString = "";
            objectStore.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    resultString += `Name: ${cursor.value.name}, SSN: ${cursor.value.ssn}\n`;
                    cursor.continue();
                } else {
                    $('#datatxt').val(resultString.trim());
                }
            };

            transaction.onerror = function(event) {
                console.error("Transaction error:", event.target.errorCode);
            };
        } else {
            alert("Please activate the database to show data.");
        }
    });

    $("#delete").click(function() {
        const nameToDelete = $("#data").val();

        if (db && nameToDelete) {
            const transaction = db.transaction(["list"], "readwrite");
            const objectStore = transaction.objectStore("list");
            const index = objectStore.index("name");

            index.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.name === nameToDelete) {
                        const request = cursor.delete();
                        request.onsuccess = function() {
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
            alert("Please enter a name to delete.");
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
