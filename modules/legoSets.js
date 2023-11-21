require('dotenv').config();
const Sequelize = require('sequelize');

const setData = require("../data/setData"); 
const themeData = require("../data/themeData");



// cinfiguring up sequelize
let sequelizePool = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: 5432,
  dialect: 'postgres',
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});


// Define the Theme model
const Theme = sequelizePool.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  }
}, {
  
  timestamps: false 
});

// Define the Set model
const Set = sequelizePool.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  num_parts: {
    type: Sequelize.INTEGER
  },
  name: {
    type: Sequelize.STRING
  },
  theme_id: {
    type: Sequelize.INTEGER
  },
  year: {
    type: Sequelize.INTEGER
  },
  img_url: {
    type: Sequelize.STRING
  }
}, {
  // Disable createdAt and updatedAt fields
  timestamps: false 
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return new Promise((resolve, reject) => {
    sequelizePool.sync().then(() => { resolve();})
    .catch((e) => {
      reject(e);
    });
  });
}

function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then((themes) => {
        resolve(themes);
      })
      .catch((e) => {
        reject(e);
      });
  });
}


function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({ include: [Theme] })
      .then((sets) => {
        resolve(sets);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function getSetByNum(setNum) {

  return new Promise((resolve, reject) => {
    Set.findOne({ where: { set_num: setNum }, include: [Theme] })
      .then((set) => {
        if (set) {
          resolve(set);
        } else {
          reject("Unable to find requested set");
        }
      })
      .catch((e) => {
        reject(e);
      });
  });

}

function getSetsByTheme(theme) {

  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
      where: {
        '$Theme.name$': {
          [Sequelize.Op.iLike]: `%${theme}%`
        }
      }
    })
      .then((sets) => {
        if (sets.length > 0) {
          resolve(sets);
        } else {
          reject("Unable to find requested sets");
        }
      })
      .catch((e) => {
        reject(e);
      });
  });

}



function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => {
        resolve();
      })
      .catch((e) => {
        reject(e.errors[0].message);
      });
  });
}

function editSet(setNum, setData) {
  return new Promise((resolve, reject) => {
    Set.update(setData, { where: { set_num: setNum } })
      .then(() => {
        resolve();
      })
      .catch((e) => {
        reject(e.errors[0].message);
      });
  });
}

function deleteSet(setNumber) {
  return new Promise((resolve, reject) => {
    Set.destroy({ where: { set_num: setNumber } })
      .then(() => {
        resolve();
      })
      .catch((e) => {
        reject(e.errors[0].message);
      });
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };

// Code Snippet to insert existing data from Set / Themes

// sequelizePool
//   .sync()
//   .then( async () => {
//     try{
//       await Theme.bulkCreate(themeData);
//       await Set.bulkCreate(setData); 
//       console.log("-----");
//       console.log("data inserted successfully");
//     }catch(err){
//       console.log("-----");
//       console.log(err.message);

      // NOTE: If you receive the error:

      // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"

      // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".   

      // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
  //   }

  //   process.exit();
  // })
  // .catch((err) => {
  //   console.log('Unable to connect to the database:', err);
  // });