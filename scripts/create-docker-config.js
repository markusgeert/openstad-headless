require('dotenv').config();
if (typeof process.env.FORCE_HTTP == 'undefined') process.env.FORCE_HTTP = 'yes';
const config = require('./config');
const fs = require('fs').promises;

(async function() {
  try {
    let configfile = `
MYSQL_ROOT_PASSWORD=${ process.env.DB_PASSWORD }
MYSQL_USER=${ process.env.DB_USERNAME }
MYSQL_PASSWORD=${ process.env.DB_PASSWORD }
AUTH_DB_NAME=${ process.env.AUTH_DB_NAME }
API_DB_NAME=${ process.env.API_DB_NAME }
IMAGE_DB_NAME=${ process.env.IMAGE_DB_NAME }

API_URL=${ process.env.API_URL }
API_PORT=${ process.env.API_PORT }
API_HOSTNAME=${ process.env.API_DOMAIN }
API_EXPRESS_PORT=${ process.env.API_PORT }
API_DATABASE_USER=${ process.env.API_DB_USERNAME }
API_DATABASE_PASSWORD=${ process.env.API_DB_PASSWORD }
API_DATABASE_DATABASE=${ process.env.API_DB_NAME }
API_DATABASE_HOST=${ process.env.API_DB_HOST || 'openstad-mysql' }
API_EMAILADDRESS=${ process.env.API_FROM_EMAIL_ADDRESS }
API_MAIL_FROM=${ process.env.API_MAIL_FROM }
API_MAIL_TRANSPORT_SMTP_PORT=${ process.env.API_SMTP_PORT }
API_MAIL_TRANSPORT_SMTP_HOST=${ process.env.API_SMTP_HOST }
API_MAIL_TRANSPORT_SMTP_REQUIRESSL=${ process.env.API_SMTP_SSL }
API_MAIL_TRANSPORT_SMTP_AUTH_USER=${ process.env.API_SMTP_USERNAME }
API_MAIL_TRANSPORT_SMTP_AUTH_PASS=${ process.env.API_SMTP_PASSWORD }
#API_NOTIFICATIONS_ADMIN_EMAILADDRESS=${ process.env.API_NOTIFICATIONS_ADMIN_EMAILADDRESS }
API_AUTHORIZATION_JWTSECRET=${ process.env.API_JWT_SECRET }
API_AUTHORIZATION_FIXEDAUTHTOKENS=${ process.env.API_FIXED_AUTH_KEY }
AUTH_API_URL=${ process.env.AUTH_APP_URL }

AUTH_APP_URL=${ process.env.AUTH_APP_URL }
AUTH_DOMAIN=${ process.env.AUTH_DOMAIN }
AUTH_PORT=${ process.env.AUTH_PORT }
AUTH_DB_HOST=${ process.env.AUTH_DB_HOST || 'openstad-mysql' }
AUTH_DB_USER=${ process.env.AUTH_DB_USERNAME }
AUTH_DB_PASSWORD=${ process.env.AUTH_DB_PASSWORD }
AUTH_DB_NAME=${ process.env.AUTH_DB_NAME }
AUTH_MAIL_SERVER_URL=${ process.env.AUTH_MAIL_SERVER_URL }
AUTH_MAIL_SERVER_PORT=${ process.env.AUTH_MAIL_SERVER_PORT }
AUTH_MAIL_SERVER_SECURE=${ process.env.AUTH_MAIL_SERVER_SECURE }
AUTH_MAIL_SERVER_PASSWORD=${ process.env.AUTH_MAIL_SERVER_PASSWORD }
AUTH_MAIL_SERVER_USER_NAME=${ process.env.AUTH_MAIL_SERVER_USER_NAME }
AUTH_EMAIL_ASSETS_URL=${ process.env.AUTH_EMAIL_ASSETS_URL }
AUTH_FROM_NAME=${ process.env.AUTH_FROM_NAME }
AUTH_FROM_EMAIL=${ process.env.AUTH_FROM_EMAIL }
AUTH_ADMIN_CLIENT_ID=${ process.env.AUTH_ADMIN_CLIENT_ID }
AUTH_ADMIN_CLIENT_SECRET=${ process.env.AUTH_ADMIN_CLIENT_SECRET }
AUTH_FIRST_CLIENT_ID=${ process.env.AUTH_FIRST_CLIENT_ID }
AUTH_FIRST_CLIENT_SECRET=${ process.env.AUTH_FIRST_CLIENT_SECRET }
AUTH_FIRST_LOGIN_CODE=${ process.env.AUTH_FIRST_LOGIN_CODE }

IMAGE_APP_URL=${ process.env.IMAGE_APP_URL }
IMAGE_PORT_API=${ process.env.IMAGE_PORT_API }
IMAGE_PORT_IMAGE_SERVER=${ process.env.IMAGE_PORT_IMAGE_SERVER }
IMAGE_DB_HOST=${ process.env.IMAGE_DB_HOST || 'openstad-mysql' }
IMAGE_DB_USER=${ process.env.IMAGE_DB_USERNAME }
IMAGE_DB_PASSWORD=${ process.env.IMAGE_DB_PASSWORD }
IMAGE_DB_NAME=${ process.env.IMAGE_DB_NAME }
IMAGE_IMAGES_DIR=${ process.env.IMAGE_IMAGES_DIR || '/opt/image-server/images' }
IMAGE_THROTTLE=${ process.env.IMAGE_THROTTLE }
IMAGE_THROTTLE_CC_PROCESSORS=${ process.env.IMAGE_THROTTLE_CC_PROCESSORS }
IMAGE_THROTTLE_CC_PREFETCHER=${ process.env.IMAGE_THROTTLE_CC_PREFETCHER }
IMAGE_THROTTLE_CC_REQUESTS=${ process.env.IMAGE_THROTTLE_CC_REQUESTS }

ADMIN_URL=${ process.env.ADMIN_URL }
ADMIN_DOMAIN=${ process.env.ADMIN_DOMAIN }
ADMIN_PORT=${ process.env.ADMIN_PORT }
ADMIN_SECRET=${ process.env.ADMIN_SECRET }
`

    const ip = require("ip");
    let localIP = ip.address();
    configfile = configfile.replace(/localhost/g, localIP);
    
    await fs.writeFile('./.env.docker', configfile);

    console.log(`
Config is created.
You can now build and run a docker environment using the command.
docker-compose -f docker-compose.development.yml --env-file .env.docker up --build
   
Once that is running you can visit the servers on these urls:
List ideas: ${ process.env.API_URL.replace(/localhost/g, localIP) }/api/project/1/idea
Login: ${ process.env.API_URL.replace(/localhost/g, localIP) }/auth/project/1/login
Which should redirect you to the login form: ${ process.env.AUTH_APP_URL.replace(/localhost/g, localIP) }/auth/code/login?clientId=uniquecode
Show an image: ${ process.env.IMAGE_APP_URL.replace(/localhost/g, localIP) }/image/forum.romanum.06.webp
Admin server: ${ process.env.ADMIN_URL.replace(/localhost/g, localIP) }/

You can login using the code ${ process.env.AUTH_FIRST_LOGIN_CODE }

`);

  } catch(err) {
    console.log(err);
  }
})()

