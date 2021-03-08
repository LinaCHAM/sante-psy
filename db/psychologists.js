const knexConfig = require("../knexfile")
const knex = require("knex")(knexConfig)
const date = require("../utils/date")

module.exports.psychologistsTable =  "psychologists";


module.exports.getPsychologists = async () => {
  try {
    const psychologists = knex.column(
      knex.raw('UPPER("lastName") as "lastName"'), // force to use quote otherwise knex understands it as "lastname"
      'adeli',
      'firstNames',
      'email',
      'address',
      'departement',
      'region',
      'phone',
      'website',
      'teleconsultation',
      'description')
        .select()
        .from(module.exports.psychologistsTable)
        .whereNot('archived', true)
        .where('state', 'accepte');
    return psychologists;
  } catch (err) {
    console.error(`Impossible de récupérer les psychologistes`, err)
    throw new Error(`Impossible de récupérer les psychologistes`)
  }
}

/**
 * Perform a UPSERT with https://knexjs.org/#Builder-merge
 * @param {*} psy
 */
module.exports.savePsychologistInPG = async function savePsychologistInPG(psyList) {
  console.log(`UPSERT of ${psyList.length} psychologists into PG....`);
  const updatedAt = date.getDateNowPG(); // use to perform UPSERT in PG

  const upsertArray = psyList.map( psy => {
    const upsertingKey = 'dossierNumber';
    try {
      return knex(module.exports.psychologistsTable)
      .insert(psy)
      .onConflict(upsertingKey)
      .merge({ // update every field and add updatedAt
        firstNames : psy.firstNames,
        lastName : psy.lastName,
        archived : psy.archived,
        state : psy.state,
        address: psy.address,
        region: psy.region,
        departement: psy.departement,
        phone: psy.phone,
        website: psy.website,
        email: psy.email,
        personalEmail: psy.personalEmail,
        teleconsultation: psy.teleconsultation,
        description: psy.description,
        training: psy.training,
        adeli: psy.adeli,
        diploma: psy.diploma,
        languages: psy.languages,
        updatedAt: updatedAt
      });
    } catch (err) {
      console.error(`Error to insert ${psy}`, err);
    }
  });

  const query = await Promise.all(upsertArray);

  console.log(`UPSERT into PG : done`);

  return query;
}

module.exports.getNumberOfPsychologists = async function getNumberOfPsychologists() {
  const query = await knex(module.exports.psychologistsTable)
  .select('archived', 'state')
  .count('*')
  .groupBy('archived', 'state');

  return query;
}


/**
 * Only return accepted psychologist
 * @param {*} email
 */
module.exports.getPsychologistByEmail = async function getPsychologistByEmail(email) {
  return await knex(module.exports.psychologistsTable)
  .where('personalEmail', email)
  .where('state', 'accepte')
  .first();
}

module.exports.countAcceptedPsychologistsByPersonalEmail = async () => {
  return await knex(module.exports.psychologistsTable)
    .select('personalEmail', 'state')
    .where('state', 'accepte')
    .count('*')
    .groupBy('personalEmail', 'state');
}

