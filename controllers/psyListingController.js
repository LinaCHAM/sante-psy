const dbPsychologists = require('../db/psychologists');

module.exports.getPsychologist = async function getPsychologist(req, res) {
  try {
    const time = `getting all psychologists from Postgres (query id #${Math.random().toString()})`;
    console.time(time);
    const psyList = await dbPsychologists.getPsychologists();
    console.timeEnd(time);

    res.json({
      psyList,
    });
  } catch (err) {
    req.flash('error', 'Impossible de récupérer les psychologues. Réessayez ultérieurement.');
    console.error('getPsychologist', err);
    res.render('psyListing', {
      psyList: [],
    });
  }
};
