// modules/@apostrophecms/global/index.js
const fs                = require('fs');
const fields            = require('./lib/fields');
const arrangeFields     = require('./lib/arrangeFields');

module.exports = {
  options: {
    deferWidgetLoading: true
  },
  init: function (self) {
    //   console.log('self.data', self.data);
    //   console.log('self.apos.data', self.apos.data);
  },

  middleware(self) {
    return {
      async enrich(req, res, next) {
        req.data.projectConfig = {
          organisationName: 'Amsterdam'
        };
        req.data.global.projectName = 'Openstad';
        req.project = self.apos.options.project;          

        // system defaults
        let cmsDefaults = process.env.CMS_DEFAULTS;
        try {
          if (typeof cmsDefaults == 'string') cmsDefaults = JSON.parse(cmsDefaults);
        } catch(err) {}

        // analytics
        if (req.data.global.analyticsType == 'serverdefault') {
          req.data.global.analyticsType = cmsDefaults.analyticsType;
          req.data.global.analyticsIdentifier = cmsDefaults.analyticsIdentifier;
          req.data.global.analyticsCodeBlock = cmsDefaults.analyticsCodeBlock;
        }

        // cookie consent
        req.data.global.cookieConsentDefined = req.data.global.useCookieWarning ? req.cookies && typeof(req.cookies['openstad-cookie-consent']) != 'undefined' : undefined;
        req.data.global.cookieConsent = req.data.global.useCookieWarning ? req.cookies && req.cookies['openstad-cookie-consent'] == 1 : true;

        return next();
      }
    };
  },

  fields: {

    add: {

      siteTitle: {
        type: 'string',
        label: 'Site titel'
      },

      siteLogo: {
        type: 'attachment',
        label: 'Site logo',
        fileGroup: 'images'
      },

      cssExtras: {
        type: 'string',
        textarea: true,
        def: '#logo-image {\n  max-height: 50px;\n}',
        label: 'Extra CSS',
      },
      customCssLink: {
        type: 'string',
        label: 'URL voor CSS imports (optioneel)',
      },
      compactMenu: {
        type: 'boolean',
        label: 'Compacte weergave van het hoofdmenu.',
        def: false
      },
      analyticsType:   {
        type: 'select',
        permission: 'admin',
        label: 'Analytics type',
        def: 'none',
        choices: [
          {
            value: 'none',
            label: "No analytics",
          },
          {
            value: 'google-analytics',
            label: "Google Analytics (with a property like G-xxxxx)",
            showFields: ['analyticsIdentifier']
          },
          {
            value: 'custom',
            label: "Custom: use a custom codeblock",
            showFields: ['analyticsCodeBlock']
          },
          {
            value: 'serverdefault',
            label: "Use the server default settings",
          },
        ]
      },

      useCookieWarning: {
        type: 'boolean',
        label: 'Use a cookie warning',
        def: false,
        choices: [
          {
            label: 'Yes',
            value: true,
            showFields: [
              'cookiePageLink'
            ]
          },
          {
            label: 'No',
            value: false
          }
        ]
      },

      cookiePageLink: {
        type: 'string',
        label: "Link to 'about cookies' page",
        def: '/about-cookies',
        required: true,
        if: {
          useCookieWarning: true
        },
      },

      analyticsIdentifier: {
        type: 'string',
        label: 'Google Analytics Property ID (like G-xxxxx)',
        if: {
          analyticsType: 'google-analytics'
        },
      },

      analyticsCodeBlock: {
        type: 'string',
        permission: 'admin',
        label: 'Custom code',
        if: {
          analyticsType: 'custom'
        },
      },

    },

    group: {
      basics: {
        label: 'Algemene instellingen',
        fields: [ 'siteTitle', 'siteLogo' ],
      },
      css: {
        label: 'Vormgeving',
        fields: [ 'cssExtras', 'customCssLink', 'compactMenu' ],
      },
      cookies: {
        label: 'Cookie instellingen',
        fields: [ 'useCookieWarning', 'cookiePageLink' ],
      },
      analitics: {
        label: 'Analitics',
        fields: [ 'analyticsType', 'analyticsIdentifier', 'analyticsCodeBlock' ],
      },
    }
  }

};



/*
Todo, move over this to new config:

module.exports = {
  improve: 'apostrophe-global',
  addFields: fields,
  afterConstruct: function(self) {
    self.expressMiddleware.push(self.overrideGlobalDataWithProjectConfig);
  },
  construct: function (self, options) {
    require('./lib/api')(self, options);
    
    self.on('apostrophe:modulesReady', 'setSyncFields');
    self.on('apostrophe-docs:beforeSave', 'formatGlobalFields');
    self.on('apostrophe-docs:afterSave', 'syncApi');
    self.on('apostrophe-docs:afterSave', 'clearCache');


    var superPushAssets = self.pushAssets;
    self.pushAssets = function () {
        superPushAssets();
        self.pushAsset('script', 'always', { when: 'always' });
    };

    options.arrangeFields = arrangeFields.concat(options.arrangeFields || []);

    self.apos.app.use((req, res, next) => {
      req.data.global = req.data.global ? req.data.global : {};
      return next();
    });

    self.apos.app.use((req, res, next) => {
      const projectConfig = self.apos.settings.getOption(req, 'projectConfig');
      // load env sheets that have been set for complete Environment, not just one project specific
      if (process.env.STYLESHEETS) {
        const sheets = process.env.STYLESHEETS.split(',');
        req.data.envStyleSheets = sheets;
      }

      // for legacy purposes, remove to better solutions at some point
      // Amsterdam
      if (!req.data.global.projectLogo && process.env.LOGO_AMSTERDAM && process.env.LOGO_AMSTERDAM === 'yes') {
        //make sure we
        req.data.global.projectLogo = 'amsterdam';
      }



      // WARNING!!!! ApostrhopeCMS exposes global values in HTML often, so DONT add senstive info in global
      req.data.global.projectConfig = {
        ideas: projectConfig.ideas,
        articles: projectConfig.articles,
        polls: projectConfig.polls,
        votes: projectConfig.votes,
        area: projectConfig.area,
        arguments:projectConfig.arguments,
        openstadMap:projectConfig.openstadMap,
        users: {
          allowUseOfNicknames: projectConfig.users && projectConfig.users.allowUseOfNicknames ? projectConfig.users.allowUseOfNicknames : false
        }
      };

      req.data.originalUrl = req.originalUrl;

      // use defaults from env vars
      let cmsDefaults = process.env.CMS_DEFAULTS;
      try {
        if (typeof cmsDefaults == 'string') cmsDefaults = JSON.parse(cmsDefaults);
      } catch(err) {
      }
      req.data.global.cmsDefaults = cmsDefaults
      if (typeof req.data.global.analyticsType === 'undefined' || req.data.global.analyticsType === '' ) {
        req.data.global.analyticsType = ( cmsDefaults && cmsDefaults.analyticsType ) || 'none';
      }
      if (req.data.global.analyticsType === 'serverdefault' ) {
        req.data.global.analyticsType = ( cmsDefaults && cmsDefaults.analyticsType ) || 'none';
        req.data.global.analyticsCodeBlock = cmsDefaults && cmsDefaults.analyticsCodeBlock;
        req.data.global.analyticsIdentifier = cmsDefaults && cmsDefaults.analyticsIdentifier;
      }

      // backwards compatibility for analytics
      // TODO: is there a way to use the value of an old field as default for a new field?
      if (typeof req.data.global.analyticsType == 'undefined' || ( req.data.global.analyticsType == 'google-analytics-old-style' && req.data.global.analyticsIdentifier == '' && req.data.global.analytics ) ) {
        req.data.global.analyticsType = 'google-analytics-old-style';
        req.data.global.analyticsIdentifier = req.data.global.analytics;
      }

      // get the identifier for making sure that the custom js/css files we load in also bust the cache
      req.data.assetsGeneration = fs.existsSync('data/generation') ? fs.readFileSync('data/generation').toString().trim() : Math.random().toString(36).slice(-5);
      //add query tot data object, so it can be used in templates
      req.data.query = req.query;

      next();
    });
  }
};
*/

