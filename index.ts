import bodyParser from 'body-parser';
import express from 'express';
import expressSanitizer from 'express-sanitizer';
import dotenv from 'dotenv';
import path from 'path';

import expressJWT from 'express-jwt';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import bearerToken from 'express-bearer-token';

import cors from 'cors';
import csrf from 'csurf';

import config from './utils/config';
import cspConfig from './utils/csp-config';
import sentry from './utils/sentry';

import configController from './controllers/configController';
import dashboardController from './controllers/dashboardController';
import appointmentsController from './controllers/appointmentsController';
import patientsController from './controllers/patientsController';
import psyListingController from './controllers/psyListingController';
import loginController from './controllers/loginController';
import faqController from './controllers/faqController';
import reimbursementController from './controllers/reimbursementController';

import cookie from './utils/cookie';

dotenv.config();

const { appName } = config;
const appDescription = 'Accompagnement psychologique pour les étudiants';
const appRepo = 'https://github.com/betagouv/sante-psy';

const app = express();

// Desactivate debug log for production as they are a bit too verbose
if (!config.activateDebug) {
  console.log('console.debug is not active - thanks to ACTIVATE_DEBUG_LOG env variable');
  console.debug = () => {};
}

app.use(cspConfig);
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(bearerToken());

app.use('/static', express.static('static'));
app.use(express.static('./frontend/dist'));

if (config.useCSRF) {
  console.log('Using CSRF protection');
  app.use(csrf({ cookie: true }));
} else {
  console.log('NOT using CSRF protection due to env variable USE_CSRF - should only be used for test');
}
// Mount express-sanitizer middleware here
app.use(expressSanitizer());

// Populate some variables for all views
app.use((req, res, next) => {
  if (config.useCSRF) {
    res.locals._csrf = req.csrfToken();
  } else {
    res.locals._csrf = '';
  }
  res.locals.appName = appName;
  res.locals.appDescription = appDescription;
  res.locals.appRepo = appRepo;
  res.locals.page = req.url;
  res.locals.contactEmail = config.contactEmail;
  res.locals.featureReimbursementPage = config.featureReimbursementPage;
  next();
});

app.use('/api/*',
  expressJWT({
    secret: config.secret,
    algorithms: ['HS256'],
    getToken: (req) => req.token,
  },
  (req) => {
    console.log('ici', cookie.getCurrentPsyId());
    req.psychologistId = cookie.getCurrentPsyId();
  }).unless({
    path: [
      '/api/config',
      '/api/trouver-un-psychologue',
      '/api/psychologue/sendMail',
      '/api/psychologue/login',
    ],
  }));

// prevent abuse
const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute window
  max: 1000, // start blocking after X requests for windowMs time
  message: 'Trop de requêtes venant de cette IP, veuillez réessayer plus tard.',
});
app.use(rateLimiter);

if (config.featurePsyList) {
  // prevent abuse for some rules
  const speedLimiter = slowDown({
    windowMs: 5 * 60 * 1000, // 5 minutes
    delayAfter: 100, // allow X requests per 5 minutes, then...
    delayMs: 500, // begin adding 500ms of delay per request above 100:
    // request # 101 is delayed by  500ms
    // request # 102 is delayed by 1000ms
    // request # 103 is delayed by 1500ms
    // etc.
  });
  app.get('/api/config', speedLimiter, configController.getConfig);
  app.get('/api/trouver-un-psychologue', speedLimiter, psyListingController.getPsychologist);
  app.get('/consulter-les-psychologues', speedLimiter, psyListingController.getPsychologist);
}

if (config.featurePsyPages) {
  // prevent abuse for some rules
  const speedLimiterLogin = slowDown({
    windowMs: 5 * 60 * 1000, // 5 minutes
    delayAfter: 10, // allow X requests per 5 minutes, then...
    delayMs: 500, // begin adding 500ms of delay per request above 100:
  });
  app.post('/api/psychologue/sendMail',
    speedLimiterLogin,
    loginController.emailValidators,
    loginController.sendMail);
  app.post('/api/psychologue/login', speedLimiterLogin, loginController.login);

  app.get('/api/appointments', appointmentsController.getAppointments);

  app.get('/psychologue/mes-patients', dashboardController.displayPatients);
  app.get('/psychologue/nouvelle-seance', appointmentsController.newAppointment);
  app.post('/psychologue/creer-nouvelle-seance',
    appointmentsController.createNewAppointmentValidators,
    appointmentsController.createNewAppointment);
  app.post('/psychologue/api/supprimer-seance',
    appointmentsController.deleteAppointmentValidators,
    appointmentsController.deleteAppointment);
  app.get('/psychologue/nouveau-patient', patientsController.newPatient);
  app.post('/psychologue/api/creer-nouveau-patient',
    patientsController.createNewPatientValidators,
    patientsController.createNewPatient);
  app.get('/psychologue/modifier-patient',
    patientsController.getEditPatientValidators,
    patientsController.getEditPatient);
  app.post('/psychologue/api/modifier-patient',
    patientsController.editPatientValidators,
    patientsController.editPatient);
  app.post('/psychologue/api/supprimer-patient',
    patientsController.deletePatientValidators,
    patientsController.deletePatient);

  if (config.featureReimbursementPage) {
    app.get('/psychologue/mes-remboursements', reimbursementController.reimbursement);
    app.post('/psychologue/api/renseigner-convention',
      reimbursementController.updateConventionInfoValidators,
      reimbursementController.updateConventionInfo);
  }
}

app.get('/faq', faqController.getFaq);

app.get('/mentions-legales', (req, res) => {
  res.render('legalNotice', {
    pageTitle: 'Mentions Légales',
  });
});

app.get('/donnees-personnelles-et-gestion-des-cookies', (req, res) => {
  res.render('données-personnelles-et-gestion-des-cookies', {
    pageTitle: 'Données personnelles',
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

sentry.initCaptureConsoleWithHandler(app);

module.exports = app.listen(config.port, () => {
  console.log(`${appName} listening at http://localhost:${config.port}`);
});
