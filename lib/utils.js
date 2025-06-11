const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');

function detectBrowser(userAgent) {

  if (!userAgent)
    return '';

  var ua = userAgent.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i), browser;

  if (!ua)
    return '';

  if (userAgent.match(/Trident.*rv[ :]*11\./i)) {
    browser = "MSIE";
  }
  else if (userAgent.match(/Edge/i)) {
    browser = "Edge";
  }
  else {
    browser = ua[1];
  }

  // Detect version
  var start, end, version = null;

  if (browser === 'Safari')
    start = userAgent.indexOf('Version') + 8;
  else
    start = userAgent.indexOf(browser) + browser.length + 1;

  if (start > -1) {
    version = userAgent.substring(start);
    end = version.indexOf(' ');

    if (end > -1)
      version = version.substring(0, end);
    else
      version = version.substring(0);
  }

  if (version)
    browser += '/' + version;

  //console.log ("[detectBrowser] "+browser);
  return (browser);
}

function detectPlatform(userAgent) {

  if (!userAgent)
    return '';
  
  userAgent = userAgent.toLowerCase();

  if (userAgent.includes('windows nt')) return 'Windows';
  if (userAgent.includes('mac os x') || userAgent.includes('macintosh')) return 'macOS';
  if (userAgent.includes('android')) return 'Android';
  if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) return 'iOS';
  if (userAgent.includes('linux')) return 'Linux';
  if (userAgent.includes('okhttp')) return 'Android';

  return 'Unknown';
}

function isAdmin(jinfo) {

  if (!session)
    return false;

  if (!jinfo.hasOwnProperty('privileges'))
    return false;

  const isAdmin = jinfo.privileges.some(role => role.toLowerCase() === 'admin');

  return isAdmin;
}

function hasPrivilege(jinfo, privilege) {

  if (!session)
    return false;

  if (!jinfo.hasOwnProperty('privileges'))
    return false;

  const included = jinfo.privileges.some(role => role.toLowerCase() === privilege.toLowerCase());

  return included || isAdmin(jinfo);
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  return { days, hours, minutes, seconds: secs };
}

function getSystemMetrics() {

  var uptime = '';

  try {
    const raw = fs.readFileSync('/proc/uptime', 'utf8');
    const [uptimeSecondsStr] = raw.trim().split(' ');
    const uptimeSeconds = parseFloat(uptimeSecondsStr);

    const formatted = formatUptime(uptimeSeconds);

    uptime = formatted.days + ' days, ' + formatted.hours + ' hours, ' + formatted.minutes + ' minutes';
  } catch (err) {
    console.error('Unable to read /proc/uptime: ', err.message );
  }

  // Memory
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  // Disk
  let diskData = {};
  try {
    const output = execSync('df -k /host || df -k /').toString();
    const lines = output.trim().split('\n');
    const dataLine = lines[1]; // seconda riga: dati
    const parts = dataLine.split(/\s+/);

    const size = parseInt(parts[1]) * 1024;       // da KB a byte
    const used = parseInt(parts[2]) * 1024;
    const available = parseInt(parts[3]) * 1024;
    //const usagePercent = parseFloat(parts[4].replace('%', ''));
    const usagePercent = (used / size) * 100 ;

    diskData = {
      total: size,
      used,
      available,
      usagePercent
    };
  } catch (err) {
    diskData = { error: 'Errore nel recupero del disco' };
  }

  return {
    system: {
      uptime: uptime
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usagePercent: (usedMem / totalMem) * 100
    },
    disk: diskData
  };
}

export { detectBrowser, detectPlatform, isAdmin, hasPrivilege, getSystemMetrics };
