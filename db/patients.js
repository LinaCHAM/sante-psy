const knexConfig = require("../knexfile")
const knex = require("knex")(knexConfig)

module.exports.patientsTable = "patients";

module.exports.getPatientById = async (patientId) => {
  try {
    const patientArray =  await knex("patients")
      .where("id", patientId)
      .returning('*')

    console.log(`${patientArray}`)
    console.log(`${patientArray[0].lastName}`)
    return patientArray[0]
  } catch (err) {
    console.error("Erreur de récupération du patient", err)
    throw new Error("Erreur de récupération du patient")
  }
}

module.exports.getPatients = async () => {
  try {
    const patientArray = await knex(module.exports.patientsTable).select()
        .orderBy("lastName")
    return patientArray
  } catch (err) {
    console.error(`Impossible de récupérer les patients`, err)
    throw new Error(`Impossible de récupérer les patients`)
  }
}

module.exports.insertPatient = async (firstNames, lastName, INE) => {
  try {
    const patientsArray = await knex(module.exports.patientsTable).insert({
      firstNames,
      lastName,
      INE,
    }).returning("*");
    return patientsArray[0];
  } catch (err) {
    console.error("Erreur de sauvegarde du patient", err)
    throw new Error("Erreur de sauvegarde du patient")
  }
}

module.exports.updatePatient = async (id, firstNames, lastName, INE) => {
  try {
    const updateResult = await knex(module.exports.patientsTable)
      .where("id", id)
      .update({
        firstNames,
        lastName,
        INE
      })
    console.log(`RESULT: ${updateResult}`)
  } catch (err) {
    console.error("Erreur de modification du patient", err)
    throw new Error("Erreur de modification du patient")
  }
}
