const fs = require('fs');
const path = require('path');

// application variables
const databaseHost = 'localhost';
const databaseUser = 'root';
const databasePass = '';
const databaseName = 'burger_db';
const databaseTable = 'burgers';
const databaseFieldName = 'burger_name';
const databaseFieldBool = 'devour';
const routeName = 'burger';
const gitHubUser = 'kridlet';

const mkDir = function (dirName) {
    try {
        fs.mkdirSync(dirName);
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
};

// probably could use recursion here. let's come back to that. 
const mkdirPath = function (dirPath) {
    const pathElements = dirPath.split(path.sep);
    // For each folder in the path, call mkdirSync()
    for (let i = 1; i <= pathElements.length; i++) {
        mkDir(path.join.apply(null, pathElements.slice(0, i)));
    }
};

// append string file
const writeFile = function (filePath, fileString) {
    fs.writeFile(filePath, fileString, { flag: 'w' }, function (err) {
        if (err) throw err;
        console.log(filePath + ' created');
    });
};

// create directories
let directories = ["config", "controllers", "models", "public/assets/css", "public/assets/js", "views/layouts"];
directories.forEach(mkdirPath);

let connectionString = `
// *********************************************************************************
// CONNECTION.JS - THIS FILE INITIATES THE CONNECTION TO MYSQL
// *********************************************************************************

require("dotenv").config();
const mysql = require("mysql");
const keys = require("../keys.js");

// Set up our connection information
const connection = mysql.createConnection({
  port: 3306,
  host: keys.dbConnect.dbHost,
  user: keys.dbConnect.dbUser,
  password: keys.dbConnect.dbPassword,
  // database: keys.dbConnect.dbName
});

// Connect to the database
connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  connection.query("CREATE DATABASE IF NOT EXISTS ${databaseName}", function (err, result) {
    if (err) {
      console.error("error creating database: " + err.stack);
      return;
    }
    var sql = "USE ${databaseName};";
    connection.query(sql, function (err, result) {
      if (err) throw err;
        if (err) throw err;
        var sql = "CREATE TABLE IF NOT EXISTS ${databaseTable} (id int(11) NOT NULL AUTO_INCREMENT,${databaseFieldName} varchar(255) DEFAULT NULL, ${databaseFieldBool} tinyint(1) DEFAULT NULL, dateCreated datetime DEFAULT CURRENT_TIMESTAMP, dateModified datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          var sql = "select * from ${databaseTable}";
          connection.query(sql, function (err, result) {
            if (err) throw err;
            if (!result.length) {
              var sql = "INSERT INTO ${databaseTable} (${databaseFieldName}, ${databaseFieldBool}) VALUES ('${databaseFieldName} 1', '0'), ('${databaseFieldName} 2', '0'), ('${databaseFieldName} 3', '0'), ('${databaseFieldName} 4', '0'), ('${databaseFieldName} 5', '0'), ('${databaseFieldName} 6', '1'), ('${databaseFieldName} 7', '1'), ('${databaseFieldName} 8', '1');";
              connection.query(sql, function (err, result) {
                if (err) throw err;
                console.log("${databaseTable} records inserted");
              });
            } else {
              console.log("table is not empty");
            }
          });
          console.log("${databaseTable} table created");
        });
      console.log("using ${databaseName}");
    });
    console.log("${databaseName} database created");
  });
  console.log("connected to as id " + connection.threadId);
});

// Export connection
module.exports = connection;
`;

writeFile ('config/connection.js', connectionString);

let ormString = `
// Import MySQL connection.
var connection = require("../config/connection.js");

// Object for all our SQL statement functions.
var orm = {
  selectAll: function (cb) {
    var queryString = "SELECT * FROM ${databaseTable};";
    connection.query(queryString, function (err, result) {
      if (err) {
        throw err;
      }
      cb(result);
    });
  },
  insertOne: function (val, cb) {
    var queryString = "INSERT INTO ${databaseTable} (${databaseFieldName}, ${databaseFieldBool}) VALUES ('" + val + "', 0)";

    connection.query(queryString, function (err, result) {
      if (err) {
        throw err;
      }
      cb(result);
    });
  },
  updateOne: function (val, cb) {
    var queryString = "UPDATE ${databaseTable} SET ${databaseFieldBool} = 1 WHERE id = " + val + ";";

    connection.query(queryString, function (err, result) {
      if (err) {
        throw err;
      }
      cb(result);
    });
  }
};

// Export the orm object for the model.
module.exports = orm;
`;

writeFile ('config/orm.js', ormString);

let modelString = `
// Import the ORM to create functions that will interact with the database.
var orm = require("../config/orm.js");

var ${routeName} = {
  all: function (cb) {
    orm.selectAll(function (res) {
      cb(res);
    });
  },
  create: function (val, cb) {
    orm.insertOne(val, function (res) {
      cb(res);
    });
  },
  update: function (val, cb) {
    orm.updateOne(val, function (res) {
      cb(res);
    });
  },
};

// Export the database functions for the controller
module.exports = ${routeName};
`;

writeFile ('models/' + routeName + '.js', modelString);

let controllerString = `
var express = require("express");

var router = express.Router();

// Import the model to use its database functions.
var ${routeName} = require("../models/${routeName}.js");

// Create all our routes and set up logic within those routes where required.
router.get("/", function(req, res) {
  ${routeName}.all(function(data) {
    var hbsObject = {
      ${databaseTable}: data
    };
    res.render("index", hbsObject);
  });
});

router.post("/api/${databaseTable}", function(req, res) {
  ${routeName}.create(req.body.name, function(result) {
    // Send back the ID of the new ${routeName}
    res.json({ id: result.insertId });
  });
});

router.put("/api/${databaseTable}/:id", function(req, res) {
  ${routeName}.update(req.params.id, function(result) {
    if (result.changedRows == 0) {
      // If no rows were changed, then the ID must not exist, so 404
      return res.status(404).end();
    } else {
      res.status(200).end();
    }
  });
});

// Export routes for server.js to use.
module.exports = router;
`;

writeFile ('controllers/' + databaseTable + '.js', controllerString);

let viewIndexString = `
<h1>${databaseTable}!</h1>

<h2>${databaseFieldBool} these ${databaseTable}:</h2>

<ul>
  {{#each ${databaseTable}}}
    {{#unless ${databaseFieldBool}}}
        <li>
            {{${databaseFieldName}}}
            <button class="change-${databaseFieldBool}" data-id="{{id}}">${databaseFieldBool} it</button>
        </li>
    {{/unless}}
  {{/each}}
</ul>

<h2>${databaseTable} already ${databaseFieldBool}:</h2>

<ul>
  {{#each ${databaseTable}}}
    {{#if ${databaseFieldBool}}}
        <li>
            {{${databaseFieldName}}}
        </li>
    {{/if}}
  {{/each}}
</ul>

<h2>create a new ${routeName}</h2>
<form class="create-form">

  <div class="form-group">
    <label for="${routeName}">${routeName} name:</label>
    <input type="text" id="${routeName}" name="${routeName}">
  </div>

  <button type="submit">add ${routeName}</button>
</form>
`;

writeFile ('views/index.handlebars', viewIndexString);

let mainHandlebarString = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
		<link rel="stylesheet" href="/assets/css/style.css" type="text/css" />
		<title>${databaseFieldBool} ${databaseTable}</title>
		<script src="https://code.jquery.com/jquery.js"></script>
		<script src="/assets/js/${routeName}.js"></script>
	</head>
	<body>
		{{{ body }}}
	</body>
</html>
`;

writeFile ('views/layouts/main.handlebars', mainHandlebarString);

let serverString = `
var express = require("express");
var bodyParser = require("body-parser");

var PORT = process.env.PORT || 8080;

var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
var routes = require("./controllers/${databaseTable}.js");

app.use(routes);

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
`;

writeFile ('server.js', serverString);

let publicJsString = `
// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function() {
  $(".change-${databaseFieldBool}").on("click", function(event) {
    var id = $(this).data("id");

    // Send the PUT request.
    $.ajax("/api/${databaseTable}/" + id, {
      type: "PUT",
      id: id
    }).then(
      function() {
        // Reload the page to get the updated list
        location.reload();
      }
    );
  });

  $(".create-form").on("submit", function(event) {
    // Make sure to preventDefault on a submit event.
    event.preventDefault();
    // Send the POST request.
    $.ajax("/api/${databaseTable}", {
      type: "POST",
      data: {name: $("#${routeName}").val().trim()}
    }).then(
      function() {
        // Reload the page to get the updated list
        location.reload();
      }
    );
  });
});
`;

writeFile ('public/assets/js/' + routeName + '.js', publicJsString);


let gitignoreString = `
#Mac
DS_Store

# Logs
logs
*.log

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# dotenv environment variables file
.env
`;

writeFile ('.gitignore', gitignoreString);

let envVarsString = `
# DATABASE CONNECTION CREDENTIALS
DB_NAME=${databaseName}
DB_USER=${databaseUser}
DB_PASSWORD=${databasePass}
DB_HOST=${databaseHost}
`;

writeFile ('.env', envVarsString);

let keyString = `
exports.dbConnect = {
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbHost: process.env.DB_HOST,
  };
  `;

  writeFile ('keys.js', keyString);

  let styleCssString = `
  li {
    padding: 5px;
    margin: 5px;
    background: #faebd7;
    text-decoration: none;
    list-style: none;
  }
  
  .label {
    font-weight: bold;
  }
  
  .create-update-form {
    padding: 5px;
    margin: 5px;
    background: aqua;
  }
  
  .form-group {
    margin-bottom: 5px;
  }
  `;

  writeFile ('public/assets/css/style.css', styleCssString);

  let packageJsonString = `
  {
    "name": "${routeName}",
    "version": "1.0.0",
    "description": "",
    "main": "server.js",
    "scripts": {
      "test": ""
    },
    "repository": {
      "type": "git",
      "url": "git+https://github.com/${gitHubUser}/${routeName}.git"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "bugs": {
      "url": "https://github.com/${gitHubUser}/${routeName}/issues"
    },
    "homepage": "https://github.com/${gitHubUser}/${routeName}#readme",
    "dependencies": {
      "body-parser": "^1.18.2",
      "dotenv": "^5.0.1",
      "express": "^4.16.3",
      "express-handlebars": "^3.0.0",
      "mysql": "^2.15.0"
    }
  }
  `;

  writeFile ('package.json', packageJsonString);
